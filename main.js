import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

import {PiecewiseLinear} from "./piecewise_linear.js";

// Setup SVG elements
const svg = d3.select("#functionplot");
const paramsvg = d3.select("#parameterplot");
const basicFunctionPlot = d3.select("#basic-functionplot");
let current_stride_temp = null;
const SECONDS_TO_PLOT = 10;

// Apply theme-based colors to SVG elements
function updateSvgColors() {
    const isThemeDark = document.body.getAttribute('data-theme') === 'dark';
    
    // Update SVG elements with theme colors
    d3.selectAll("svg")
        .style("background-color", "var(--plot-bg-color)");
    
    d3.selectAll("svg line")
        .style("stroke", "var(--plot-grid-color)");
    
    d3.selectAll("svg .axis line, svg .axis path")
        .style("stroke", "var(--text-color)");
    
    d3.selectAll("svg .axis text")
        .style("fill", "var(--text-color)");
}

// Listen for theme changes
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
            updateSvgColors();
        }
    });
});

observer.observe(document.body, { attributes: true });

// Create a basic acceleration plot for the third section
function createBasicAccelerationPlot(data) {
    const width = 800;
    const height = 400;
    const margin = {top: 20, right: 30, bottom: 30, left: 40};
    
    const x = d3.scaleLinear()
        .domain([0, data.length - 1])
        .range([margin.left, width - margin.right]);

    const x_seconds = d3.scaleLinear()
        .domain([0, (data.length) / 80])
        .range([margin.left, width - margin.right]);
    
    const y = d3.scaleLinear()
        .domain([0, 2])
        .nice()
        .range([height - margin.bottom, margin.top]);
    
    basicFunctionPlot.attr("viewBox", [0, 0, width, height]);
    
    // Add X axis
    basicFunctionPlot.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x_seconds).ticks(width / 80).tickSizeOuter(0))
        .append("text")
        .attr("x", width - margin.right)
        .attr("y", -10)
        .attr("fill", "var(--text-color)")
        .attr("text-anchor", "end")
        .text("Time (Seconds)");
    
    // Add Y axis
    basicFunctionPlot.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .append("text")
        .attr("x", 10)
        .attr("y", margin.top)
        .attr("fill", "var(--text-color)")
        .attr("text-anchor", "start")
        .text("Acceleration Magnitude (g)");
    
    
    // Plot the data
    const line = d3.line()
        .x((d, i) => x(i))
        .y(d => y(d));
    
    basicFunctionPlot.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "var(--plot-line-color-1)")
        .attr("stroke-width", 2)
        .attr("d", line);
}

d3.text("smoothed_vector_magnitudes.txt").then(function(data) {
    let values = data.trim().split("\n").map(Number);
    const MAIN_MINUTE = 822;

    values = values.slice(((MAIN_MINUTE) % 60)*60*80, ((MAIN_MINUTE + 1) % 60)*60*80).slice(0, 80*SECONDS_TO_PLOT);
    let REAL_ACC_DATA = new PiecewiseLinear(Array.from({length: values.length}, (_, i) => i), values);
    
    // Create the basic acceleration plot for section 3
    createBasicAccelerationPlot(values);
    
    const width = 800;
    const height = 400;
    const margin = {top: 20, right: 30, bottom: 30, left: 40};

    const x = d3.scaleLinear()
        .domain([0, values.length - 1])
        .range([margin.left, width - margin.right]);

    const x_seconds = d3.scaleLinear()
        .domain([0, values.length/80])
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([0, 2])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const xAxis = g => g
        .attr("class", "axis")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x_seconds).ticks(width / 80).tickSizeOuter(0))
        .append("text")
        .attr("x", width - margin.right)
        .attr("y", -10)
        .attr("fill", "var(--text-color)")
        .attr("text-anchor", "end")
        .text("Time (Seconds)");

    const yAxis = g => g
        .attr("class", "axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .append("text")
        .attr("x", 10)
        .attr("y", margin.top)
        .attr("fill", "var(--text-color)")
        .attr("text-anchor", "start")
        .text("Acceleration Magnitude (g)");

    svg.attr("viewBox", [0, 0, width, height]);

    svg.append("g")
        .call(xAxis);

    svg.append("g")
        .call(yAxis);

    REAL_ACC_DATA.plot(svg, x, y, "var(--plot-line-color-1)");

    const paramX = d3.scaleLinear()
        .domain([0, 80*SECONDS_TO_PLOT])
        .range([margin.left, width - margin.right]);

    const paramY = d3.scaleLinear()
        .domain([0, .5])
        .range([height - margin.bottom, margin.top]);

    const paramXAxis = g => g
        .attr("class", "axis")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(paramX).ticks(width / 80).tickSizeOuter(0));

    const paramYAxis = g => g
        .attr("class", "axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(paramY));

    paramsvg.append("text")
        .attr("x", (width / 2))             
        .attr("y", margin.top / 2 + 50)
        .attr("text-anchor", "middle")  
        .style("font-size", "24px") 
        .style("fill", "var(--text-color)")
        .text("Similarity Heatmap");

    paramsvg.append("text")
        .attr("transform", `translate(${width / 2},${height - margin.bottom / 3 + 20})`)
        .style("text-anchor", "middle")
        .style("fill", "var(--text-color)")
        .text("Tau (Shift Parameter)")
        .style("font-size", "16px");

    paramsvg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", margin.left / 2)
        .attr("x", -height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("fill", "var(--text-color)")
        .attr("font-size", "16px")
        .text("Sigma (Scale Parameter)");

    paramsvg.attr("viewBox", [0, 0, width, height]);

    paramsvg.append("g")
        .call(paramXAxis);

    paramsvg.append("g")
        .call(paramYAxis);

    let circle_rad = 10;

    d3.text("stride_template.txt").then(function(templateData) {
        let strideTemplate = templateData.trim().split("\n").map(Number);

        let stride_temp_pwl = new PiecewiseLinear(Array.from({length: strideTemplate.length}, (_, i) => i), strideTemplate);
        
        // Get initial slider values
        let initialTau = +d3.select("#tau").property("value");
        let initialSigma = +d3.select("#sigma").property("value");
        
        // Initialize with proper scaling based on slider values
        current_stride_temp = stride_temp_pwl.scale(initialSigma);
        let initialShiftedTemplate = current_stride_temp.shift(initialTau);
        
        // Plot the initial template
        initialShiftedTemplate.plot(svg, x, y, "var(--plot-line-color-2)", "altered-template");
        
        // Display initial inner product
        let initialInnerProd = PiecewiseLinear.inner_prod(REAL_ACC_DATA, initialShiftedTemplate);
        svg.append("text")
            .text(`Similarity: ${initialInnerProd.toFixed(2)}`)
            .attr("class", "inner-prod-result")
            .attr("x", width / 2)
            .attr("y", margin.top + 20)
            .attr("text-anchor", "middle")
            .style("fill", "var(--text-color)");
            
        // Show initial position on parameter plot
        paramsvg.append("circle")
            .attr("class", "tau-sigma-circle-outlined")
            .attr("cx", paramX(initialTau))
            .attr("cy", paramY(initialSigma))
            .attr("r", circle_rad)
            .style("fill", d3.interpolateBlues(initialInnerProd / 20))
            .attr("stroke", "black")
            .attr("stroke-width", 1);

        const xValues = paramX.domain();
        const yValues = paramY.domain();

        const gridSizeX = Math.abs(paramX(xValues[1]) - paramX(xValues[0])) / 8/SECONDS_TO_PLOT; // Width of each cell
        const gridSizeY = Math.abs(paramY(yValues[1]) - paramY(yValues[0])) * 2; // Height of each cell


        function exceeds_bounds(tau, sigma) {
            return 200 * sigma + tau > 80*SECONDS_TO_PLOT;
        }

        console.log("loop started");
        for (let tau_loop = 0; tau_loop <= 80*SECONDS_TO_PLOT; tau_loop += 10) {
            for (let sigma_loop = 0.1; sigma_loop <= .5; sigma_loop += 0.01) {
                if (exceeds_bounds(tau_loop, sigma_loop)) {
                    continue;
                }
                let current_stride_temp_loop = stride_temp_pwl.scale(sigma_loop).shift(tau_loop);
                let innerprod_loop = PiecewiseLinear.inner_prod(REAL_ACC_DATA, current_stride_temp_loop);
                

                paramsvg.append("rect")
                    .attr("x", paramX(tau_loop))
                    .attr("y", paramY(sigma_loop))
                    
                    .attr("width", 1*gridSizeX)
                    
                    .attr("height", .01*gridSizeY)
                    .style("fill", d3.interpolateBlues(innerprod_loop / 10))
                    .on("click", function() {
                        svg.selectAll(".altered-template").remove();
                        current_stride_temp_loop.plot(svg, x, y, "red", "altered-template");
                        d3.select("#tau").property("value", tau_loop);
                        d3.select("#sigma").property("value", sigma_loop);
                        paramsvg.selectAll(".tau-sigma-circle-outlined").remove();

                        paramsvg.append("circle")
                            .attr("class", "tau-sigma-circle-outlined")
                            .attr("cx", paramX(tau_loop))
                            .attr("cy", paramY(sigma_loop))
                            .attr("r", circle_rad)
                            .style("fill", d3.interpolateBlues(innerprod_loop / 20))
                            .attr("stroke", "black")
                            .attr("stroke-width", 1);
                    });
        
            }
        }
        console.log("loop ended");

        d3.select("#tau").on("input", function() {
            let tau = +this.value;

            let sigma = +d3.select("#sigma").property("value");
            current_stride_temp = stride_temp_pwl.scale(sigma);
            let shiftedTemplate = current_stride_temp.shift(tau);

            
            svg.selectAll(".altered-template").remove();
            shiftedTemplate.plot(svg, x, y, "var(--plot-line-color-2)", "altered-template");

            svg.selectAll(".inner-prod-result").remove();

            let innerprod = PiecewiseLinear.inner_prod(REAL_ACC_DATA, shiftedTemplate)

            svg.append("text")
                .text(`Similarity: ${innerprod.toFixed(2)}`)
                .attr("class", "inner-prod-result")
                .attr("x", width / 2)
                .attr("y", margin.top + 20)
                .attr("text-anchor", "middle")
                .style("fill", "var(--text-color)");

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
            current_stride_temp = stride_temp_pwl.scale(sigma);
            let shiftedTemplate = current_stride_temp.shift(tau);
            
            svg.selectAll(".altered-template").remove();
            shiftedTemplate.plot(svg, x, y, "var(--plot-line-color-2)", "altered-template");
            
            svg.selectAll(".inner-prod-result").remove();

            let innerprod = PiecewiseLinear.inner_prod(REAL_ACC_DATA, shiftedTemplate)

            svg.append("text")
                .text(`Similarity: ${innerprod.toFixed(2)}`)
                .attr("class", "inner-prod-result")
                .attr("x", width / 2)
                .attr("y", margin.top + 20)
                .attr("text-anchor", "middle")
                .style("fill", "var(--text-color)");

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

    // Apply theme colors to SVG elements
    updateSvgColors();
});

// Add scroll-based animations
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.section');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // Start walking animation when the walking section is visible
                if (entry.target.id === 'visual-recognition') {
                    const walkingManContainer = document.getElementById('walking-man-container');
                    if (walkingManContainer && walkingManContainer.classList.contains('paused')) {
                        walkingManContainer.classList.remove('paused');
                    }
                }
            } else {
                // Optionally remove the active class when section is not visible
                // entry.target.classList.remove('active');
                
                // Pause walking animation when section is not visible to save resources
                if (entry.target.id === 'visual-recognition') {
                    const walkingManContainer = document.getElementById('walking-man-container');
                    if (walkingManContainer && !walkingManContainer.classList.contains('paused')) {
                        walkingManContainer.classList.add('paused');
                    }
                }
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        observer.observe(section);
    });
});