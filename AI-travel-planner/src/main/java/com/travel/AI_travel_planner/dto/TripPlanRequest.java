package com.travel.AI_travel_planner.dto;

public class TripPlanRequest {

    private String destination;
    private String period;
    private String people;
    private int budget;
    private String style;
    private String transportType;

    public TripPlanRequest() {
    }

    public TripPlanRequest(
            String destination,
            String period,
            String people,
            int budget,
            String style,
            String transportType
    ) {
        this.destination = destination;
        this.period = period;
        this.people = people;
        this.budget = budget;
        this.style = style;
        this.transportType = transportType;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public String getPeriod() {
        return period;
    }

    public void setPeriod(String period) {
        this.period = period;
    }

    public String getPeople() {
        return people;
    }

    public void setPeople(String people) {
        this.people = people;
    }

    public int getBudget() {
        return budget;
    }

    public void setBudget(int budget) {
        this.budget = budget;
    }

    public String getStyle() {
        return style;
    }

    public void setStyle(String style) {
        this.style = style;
    }

    public String getTransportType() {
        return transportType;
    }

    public void setTransportType(String transportType) {
        this.transportType = transportType;
    }
}