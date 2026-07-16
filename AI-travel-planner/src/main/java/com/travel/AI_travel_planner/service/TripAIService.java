package com.travel.AI_travel_planner.service;

import com.travel.AI_travel_planner.dto.TripPlanRequest;
import com.travel.AI_travel_planner.dto.TripPlanResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class TripAIService {

    private static final String AI_SERVER_URL =
            "http://127.0.0.1:8000/api/trip-plan";

    private final RestTemplate restTemplate;

    public TripAIService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public TripPlanResponse generateTripPlan(TripPlanRequest request) {
        return restTemplate.postForObject(
                AI_SERVER_URL,
                request,
                TripPlanResponse.class
        );
    }
}