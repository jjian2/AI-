package com.travel.AI_travel_planner.controller;

import com.travel.AI_travel_planner.dto.TripPlanRequest;
import com.travel.AI_travel_planner.dto.TripPlanResponse;
import com.travel.AI_travel_planner.service.TripAIService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/trip")
public class TripController {

    private final TripAIService tripAIService;

    public TripController(TripAIService tripAIService) {
        this.tripAIService = tripAIService;
    }

    @PostMapping("/generate")
    public TripPlanResponse generateTrip(
            @RequestBody TripPlanRequest request
    ) {
        return tripAIService.generateTripPlan(request);
    }
}