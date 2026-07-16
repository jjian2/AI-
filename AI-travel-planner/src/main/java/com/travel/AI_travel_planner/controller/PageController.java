package com.travel.AI_travel_planner.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/main")
    public String main() {
        return "main";
    }

    @GetMapping("/places")
    public String places() {
        return "places";
    }

    @GetMapping("/budget")
    public String budget() {
        return "budget";
    }

    @GetMapping("/mypage")
    public String mypage() {
        return "mypage";
    }
}