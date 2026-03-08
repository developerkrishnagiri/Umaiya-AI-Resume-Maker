package com.aicareer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class ExternalJobService {

    private final OkHttpClient httpClient = new OkHttpClient.Builder()
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Search jobs from the free Remotive API (remote jobs)
     * API: https://remotive.com/api/remote-jobs
     */
    public Map<String, Object> searchRemotiveJobs(String keyword, String category, int limit) {
        try {
            StringBuilder url = new StringBuilder("https://remotive.com/api/remote-jobs");
            List<String> params = new ArrayList<>();
            if (category != null && !category.isBlank()) {
                params.add("category=" + URLEncoder.encode(category, StandardCharsets.UTF_8));
            }
            if (keyword != null && !keyword.isBlank()) {
                params.add("search=" + URLEncoder.encode(keyword, StandardCharsets.UTF_8));
            }
            if (limit > 0) {
                params.add("limit=" + limit);
            }
            if (!params.isEmpty()) {
                url.append("?").append(String.join("&", params));
            }

            Request request = new Request.Builder()
                    .url(url.toString())
                    .get()
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                if (!response.isSuccessful() || response.body() == null) {
                    log.error("Remotive API error: {}", response.code());
                    return Map.of("jobs", List.of(), "total", 0);
                }

                String body = response.body().string();
                JsonNode root = objectMapper.readTree(body);
                JsonNode jobsNode = root.path("jobs");

                List<Map<String, Object>> jobs = new ArrayList<>();
                for (JsonNode jobNode : jobsNode) {
                    Map<String, Object> job = new HashMap<>();
                    job.put("id", "remotive_" + jobNode.path("id").asText());
                    job.put("title", jobNode.path("title").asText());
                    job.put("company", jobNode.path("company_name").asText());
                    job.put("location", jobNode.path("candidate_required_location").asText("Remote"));
                    job.put("jobType", mapJobType(jobNode.path("job_type").asText()));
                    job.put("description", jobNode.path("description").asText());
                    job.put("url", jobNode.path("url").asText());
                    job.put("publishedAt", jobNode.path("publication_date").asText());
                    job.put("salary", jobNode.path("salary").asText(""));
                    job.put("category", jobNode.path("category").asText());
                    job.put("companyLogo", jobNode.path("company_logo").asText(""));
                    job.put("tags", nodeToList(jobNode.path("tags")));
                    job.put("source", "Remotive");
                    job.put("remote", true);
                    job.put("external", true);
                    jobs.add(job);
                }

                return Map.of("jobs", jobs, "total", jobs.size());
            }
        } catch (Exception e) {
            log.error("Remotive API failed: {}", e.getMessage());
            return Map.of("jobs", List.of(), "total", 0);
        }
    }

    /**
     * Search jobs from Adzuna API (free tier: 250 requests/day)
     * API: https://api.adzuna.com/v1/api/jobs
     */
    public Map<String, Object> searchAdzunaJobs(String keyword, String location, int page, int resultsPerPage) {
        try {
            // Adzuna free API - no key needed for limited access via their public endpoint
            String country = "us"; // Default to US
            String baseUrl = String.format(
                    "https://api.adzuna.com/v1/api/jobs/%s/search/%d",
                    country, Math.max(1, page + 1));

            List<String> params = new ArrayList<>();
            params.add("results_per_page=" + Math.min(resultsPerPage, 20));
            if (keyword != null && !keyword.isBlank()) {
                params.add("what=" + URLEncoder.encode(keyword, StandardCharsets.UTF_8));
            }
            if (location != null && !location.isBlank()) {
                params.add("where=" + URLEncoder.encode(location, StandardCharsets.UTF_8));
            }
            // Use demo app id and key for free access
            params.add("app_id=a8faa390");
            params.add("app_key=df1f64d25e08a08e22b3aa0e8acd5bd7");
            params.add("content-type=application/json");

            String url = baseUrl + "?" + String.join("&", params);

            Request request = new Request.Builder()
                    .url(url)
                    .get()
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                if (!response.isSuccessful() || response.body() == null) {
                    log.warn("Adzuna API error: {} - trying Remotive fallback", response.code());
                    return searchRemotiveJobs(keyword, null, resultsPerPage);
                }

                String body = response.body().string();
                JsonNode root = objectMapper.readTree(body);
                JsonNode results = root.path("results");
                int total = root.path("count").asInt(0);

                List<Map<String, Object>> jobs = new ArrayList<>();
                for (JsonNode jobNode : results) {
                    Map<String, Object> job = new HashMap<>();
                    job.put("id", "adzuna_" + jobNode.path("id").asText());
                    job.put("title", jobNode.path("title").asText());
                    job.put("company", jobNode.path("company").path("display_name").asText("Unknown Company"));
                    job.put("location", jobNode.path("location").path("display_name").asText(""));
                    job.put("description", cleanHtml(jobNode.path("description").asText("")));
                    job.put("url", jobNode.path("redirect_url").asText());
                    job.put("publishedAt", jobNode.path("created").asText());
                    job.put("category", jobNode.path("category").path("label").asText(""));

                    // Salary
                    double salaryMin = jobNode.path("salary_min").asDouble(0);
                    double salaryMax = jobNode.path("salary_max").asDouble(0);
                    if (salaryMin > 0)
                        job.put("salaryMin", salaryMin);
                    if (salaryMax > 0)
                        job.put("salaryMax", salaryMax);

                    job.put("jobType", jobNode.path("contract_type").asText("FULL_TIME"));
                    job.put("source", "Adzuna");
                    job.put("external", true);
                    job.put("remote", jobNode.path("title").asText("").toLowerCase().contains("remote")
                            || jobNode.path("location").path("display_name").asText("").toLowerCase()
                                    .contains("remote"));
                    jobs.add(job);
                }

                return Map.of("jobs", jobs, "total", total);
            }
        } catch (Exception e) {
            log.error("Adzuna API failed: {} - trying Remotive fallback", e.getMessage());
            return searchRemotiveJobs(keyword, null, resultsPerPage);
        }
    }

    /**
     * Combined search: Merge results from multiple sources
     */
    public Map<String, Object> searchAllJobs(String keyword, String location, int page, int size) {
        // Try Adzuna first (has more varied jobs), fall back to Remotive
        Map<String, Object> adzunaResult = searchAdzunaJobs(keyword, location, page, size);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> adzunaJobs = (List<Map<String, Object>>) adzunaResult.get("jobs");

        // If Adzuna didn't return enough results, supplement with Remotive
        if (adzunaJobs.size() < size) {
            Map<String, Object> remotiveResult = searchRemotiveJobs(keyword, null, size - adzunaJobs.size());
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> remotiveJobs = (List<Map<String, Object>>) remotiveResult.get("jobs");

            List<Map<String, Object>> combined = new ArrayList<>(adzunaJobs);
            combined.addAll(remotiveJobs);
            return Map.of(
                    "jobs", combined,
                    "total",
                    ((Number) adzunaResult.get("total")).intValue() + ((Number) remotiveResult.get("total")).intValue(),
                    "page", page,
                    "size", size);
        }

        return Map.of("jobs", adzunaJobs, "total", adzunaResult.get("total"), "page", page, "size", size);
    }

    private String mapJobType(String type) {
        if (type == null)
            return "FULL_TIME";
        return switch (type.toLowerCase()) {
            case "full_time", "full time" -> "FULL_TIME";
            case "part_time", "part time" -> "PART_TIME";
            case "contract" -> "CONTRACT";
            case "freelance" -> "FREELANCE";
            case "internship" -> "INTERNSHIP";
            default -> "FULL_TIME";
        };
    }

    private List<String> nodeToList(JsonNode arrayNode) {
        List<String> list = new ArrayList<>();
        if (arrayNode != null && arrayNode.isArray()) {
            arrayNode.forEach(n -> list.add(n.asText()));
        }
        return list;
    }

    private String cleanHtml(String html) {
        if (html == null)
            return "";
        return html.replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim();
    }
}
