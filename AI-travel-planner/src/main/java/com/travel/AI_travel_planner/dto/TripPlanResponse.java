package com.travel.AI_travel_planner.dto;

import java.util.Map;

public class TripPlanResponse {

    private boolean success;
    private Map<String, Object> result;

    public TripPlanResponse() {
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public Map<String, Object> getResult() {
        return result;
    }

    public void setResult(Map<String, Object> result) {
        this.result = result;
    }
}