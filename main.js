import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

import {PiecewiseLinear} from "./piecewise_linear.js";

const svg = d3.select("#functionplot");
const paramsvg = d3.select("#parameterplot");

d3.text("smoothed_vector_magnitudes.txt").then(function(data) {
    let values = data.trim().split("\n").map(Number);
    const MAIN_MINUTE = 822;

    values = values.slice(((MAIN_MINUTE) % 60)*60*80, ((MAIN_MINUTE + 1) % 60)*60*80).slice(0, 240);
    let REAL_ACC_DATA = new PiecewiseLinear(Array.from({length: values.length}, (_, i) => i), values);
    let current_stride_temp = new PiecewiseLinear(Array.from({length: values.length}, (_, i) => i), values);

    const width = 800;
    const height = 400;
    const margin = {top: 20, right: 30, bottom: 30, left: 40};

    const x = d3.scaleLinear()
        .domain([0, values.length - 1])
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([-2, 2])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

    const yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    svg.attr("viewBox", [0, 0, width, height]);

    svg.append("g")
        .call(xAxis);

    svg.append("g")
        .call(yAxis);

    svg.append("line")
        .attr("x1", margin.left)
        .attr("x2", width - margin.right)
        .attr("y1", y(0))
        .attr("y2", y(0))
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4,4");

    REAL_ACC_DATA.plot(svg, x, y, "blue");

    const paramX = d3.scaleLinear()
        .domain([0, 240])
        .range([margin.left, width - margin.right]);

    const paramY = d3.scaleLinear()
        .domain([0, 1.2])
        .range([height - margin.bottom, margin.top]);

    const paramXAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(paramX).ticks(width / 80).tickSizeOuter(0));

    const paramYAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(paramY));

    paramsvg.append("text")
        .attr("x", (width / 2))             
        .attr("y", margin.top / 2 + 50)
        .attr("text-anchor", "middle")  
        .style("font-size", "32px") 
        .style("text-decoration", "underline")  
        .text("Similarity Heatmap");

    paramsvg.append("text")
        .attr("transform", `translate(${width / 2},${height - margin.bottom / 3 + 20})`)
        .style("text-anchor", "middle")
        .text("Tau (Shift Parameter)")
        .style("font-size", "24px");

    paramsvg.append("text")
        .attr("y", height/3)
        .attr("x", -100)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("font-size", "24px")
        .text("Sigma");
    
    paramsvg.append("text")
        .attr("y", height/3 + 30)
        .attr("x", -100)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("font-size", "24px")
        .text("(Scale Parameter)");

    paramsvg.attr("viewBox", [0, 0, width, height]);

    paramsvg.append("g")
        .call(paramXAxis);

    paramsvg.append("g")
        .call(paramYAxis);

    let circle_rad = 10;



    d3.text("stride_template.txt").then(function(templateData) {
        let strideTemplate = templateData.trim().split("\n").map(Number);

        let stride_temp_pwl = new PiecewiseLinear(Array.from({length: strideTemplate.length}, (_, i) => i), strideTemplate);
        stride_temp_pwl.plot(svg, x, y, "red", "altered-template");

        const xValues = paramX.domain();
        const yValues = paramY.domain();

        const gridSizeX = Math.abs(paramX(xValues[1]) - paramX(xValues[0])) / 24; // Width of each cell
        console.log(gridSizeX);
        const gridSizeY = Math.abs(paramY(yValues[1]) - paramY(yValues[0])); // Height of each cell


        function exceeds_bounds(tau, sigma) {
            return 200 * sigma + tau > 240;
        }

        console.log("loop started");
        for (let tau_loop = 0; tau_loop <= 240; tau_loop += 10) {
            for (let sigma_loop = 0.1; sigma_loop <= 2; sigma_loop += 0.01) {
                if (exceeds_bounds(tau_loop, sigma_loop)) {
                    continue;
                }
                if (tau_loop > 230) {
                    console.log(200 * sigma_loop + tau_loop);
                }
                let current_stride_temp_loop = stride_temp_pwl.scale(sigma_loop).shift(tau_loop);
                let innerprod_loop = PiecewiseLinear.inner_prod(REAL_ACC_DATA, current_stride_temp_loop);
                

                paramsvg.append("rect")
                    .attr("x", paramX(tau_loop))
                    .attr("y", paramY(sigma_loop))
                    .attr("width", 1*gridSizeX)
                    .attr("height", .01*gridSizeY)
                    .style("fill", d3.interpolateBlues(innerprod_loop / 20))
                    .on("click", function() {
                        svg.selectAll(".altered-template").remove();
                        current_stride_temp_loop.plot(svg, x, y, "red", "altered-template");
                    });
        
            }
        }
        console.log("loop ended");

        d3.select("#tau").on("input", function() {
            let tau = +this.value;

            let sigma = +d3.select("#sigma").property("value");
            let current_stride_temp = stride_temp_pwl.scale(sigma);
            let shiftedTemplate = current_stride_temp.shift(tau);

            
            svg.selectAll(".altered-template").remove();
            shiftedTemplate.plot(svg, x, y, "red", "altered-template");

            svg.selectAll(".inner-prod-result").remove();

            let innerprod = PiecewiseLinear.inner_prod(REAL_ACC_DATA, shiftedTemplate)

            svg.append("text")
                .text(`${innerprod}`)
                .attr("class", "inner-prod-result");

            paramsvg.selectAll(".tau-sigma-circle-outlined").remove();

            paramsvg.append("circle")
                .attr("class", "tau-sigma-circle-outlined")
                .attr("cx", paramX(tau))
                .attr("cy", paramY(sigma))
                .attr("r", circle_rad)
                .style("fill", d3.interpolateBlues(innerprod / 20))
                .attr("stroke", "black")
                .attr("stroke-width", 1);

        });

        d3.select("#sigma").on("input", function() {
            let sigma = +this.value;

            let tau = +d3.select("#tau").property("value");
            let current_stride_temp = stride_temp_pwl.shift(tau);
            let scaledTemplate = current_stride_temp.scale(sigma);
            
            svg.selectAll(".altered-template").remove();
            scaledTemplate.plot(svg, x, y, "red", "altered-template");
            
            svg.selectAll(".inner-prod-result").remove();

            let innerprod = PiecewiseLinear.inner_prod(REAL_ACC_DATA, scaledTemplate)

            svg.append("text")
                .text(`${innerprod}`)
                .attr("class", "inner-prod-result");

            paramsvg.selectAll(".tau-sigma-circle-outlined").remove();

            paramsvg.append("circle")
                .attr("class", "tau-sigma-circle-outlined")
                .attr("cx", paramX(tau))
                .attr("cy", paramY(sigma))
                .attr("r", circle_rad)
                .style("fill", d3.interpolateBlues(innerprod / 20))
                .attr("stroke", "black")
                .attr("stroke-width", 1);
        });

    });

});