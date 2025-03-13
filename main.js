import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

import {PiecewiseLinear} from "./piecewise_linear.js";

// Setup SVG elements
const svg = d3.select("#functionplot");
const paramsvg = d3.select("#parameterplot");
const basicFunctionPlot = d3.select("#basic-functionplot");
const sim_calc_top_left_svg = d3.select("#sim-calc-top-left");
const sim_calc_top_right_svg  = d3.select("#sim-calc-top-right");
const sim_calc_bottom_left_svg = d3.select("#sim-calc-bottom-left");
const sim_calc_bottom_right_svg  = d3.select("#sim-calc-bottom-right");
const peak_count_ex_svg = d3.select("#peak-counting-example");
const peak_count_real_svg = d3.select("#peak-counting-real");
const acc_data_with_steps = d3.select("#acc-data-with-steps");
const template_svg = d3.select("svg#template")

let current_stride_temp = null;
const SECONDS_TO_PLOT = 10;

// Helper function to throttle function calls - simplified version
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Helper function to debounce function calls
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Apply theme-based colors to SVG elements
function updateSvgColors() {
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
        .domain([.6, 2])
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
        .domain([.6, 2])
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
        .domain([0, 10])
        .range([margin.left, width - margin.right]);

    const paramX_seconds = d3.scaleLinear()
        .domain([0, 80*SECONDS_TO_PLOT])
        .range([margin.left, width - margin.right]);


    const paramY = d3.scaleLinear()
        .domain([-20, 20])
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
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")  
        .style("font-size", "24px") 
        .style("fill", "var(--text-color)")
        .style("font-family", "sans-serif")
        .text("Similarity Between Step Template");

    paramsvg.append("text")
        .attr("x", (width / 2))             
        .attr("y", margin.top / 2 + 30)
        .attr("text-anchor", "middle")  
        .style("font-size", "24px") 
        .style("fill", "var(--text-color)")
        .style("font-family", "sans-serif")
        .text("and Real Accelerometer Data at Each Time");

    paramsvg.append("text")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .style("text-anchor", "end")
        .style("fill", "var(--text-color)")
        .attr("x", width - margin.right)
        .attr("y", -10)
        .attr("fill", "var(--text-color)")
        .style("font-size", "12px")
        .style("font-family", "sans-serif")
        .text("Time (Seconds)");

    paramsvg.append("text")
        .attr("transform", `translate(${margin.left},0)`)
        .attr("x", 10)
        .attr("y", margin.top)
        .attr("fill", "var(--text-color)")
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .text("Similarity");

    paramsvg.attr("viewBox", [0, 0, width, height]);

    paramsvg.append("g")
        .call(paramXAxis);

    paramsvg.append("g")
        .call(paramYAxis);

    let circle_rad = 10;

    d3.text("stride_template.txt").then(function(templateData) {
        let strideTemplate = templateData.trim().split("\n").map(Number);
        let strideTemplateReshaped = strideTemplate.map(d => d / 4 + 1.3);

        let stride_temp_pwl = new PiecewiseLinear(Array.from({length: strideTemplate.length}, (_, i) => i), strideTemplate);

        // Create scales for the template plot
        const templateX = d3.scaleLinear()
            .domain([0, strideTemplate.length - 1])
            .range([margin.left, 400 - margin.right]);

        const templateY = d3.scaleLinear()
            .domain([d3.min(strideTemplateReshaped) * 0.9, d3.max(strideTemplateReshaped) * 1.1])
            .range([400 - margin.bottom, margin.top]);

        // Setup template plot
        template_svg.attr("viewBox", [0, 0, 400, 400]);
        
        template_svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,${400 - margin.bottom})`)
            .call(d3.axisBottom(templateX).ticks(5).tickSizeOuter(0));
            
        template_svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(templateY).ticks(5));

        // Add axis labels
        template_svg.append("text")
            .attr("transform", `translate(${400/2},${400 - margin.bottom/3})`)
            .style("text-anchor", "middle")
            .style("fill", "var(--text-color)")
            .style("font-size", "12px")
            .text("Time (Seconds)");
            
        // Add y-axis label
        template_svg.append("text")
            .attr("transform", `translate(${margin.left/3},${(400 - margin.top - margin.bottom)/2 + margin.top}) rotate(-90)`)
            .style("text-anchor", "middle")
            .style("fill", "var(--text-color)")
            .style("font-size", "12px")
            .text("Acceleration Magnitude (g)");

        // Plot the template
        const templateLine = d3.line()
            .x((d, i) => templateX(i))
            .y(d => templateY(d));
            
        template_svg.append("path")
            .datum(strideTemplateReshaped)
            .attr("fill", "none")
            .attr("stroke", "var(--plot-line-color-2)")
            .attr("stroke-width", 2)
            .attr("d", templateLine);

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
            
        // Create the hover circle once and just update its position
        const hoverCircle = paramsvg.append("circle")
            .attr("class", "hover-circle")
            .attr("r", circle_rad)
            .style("fill", "var(--plot-line-color-2)")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .style("visibility", "hidden");

        // Simple mousemove handler for paramsvg - works for both desktop and mobile
        paramsvg.on("mousemove touchmove", throttle(function(event) {
            const [mouseX] = d3.pointer(event);
            const xValue = paramX_seconds.invert(mouseX);
            const closestIndex = Math.round(xValue);

            // Update hover circle when mouse is within bounds
            if (closestIndex >= 0 && closestIndex < sim_scores.length) {
                const yValue = sim_scores[closestIndex];
                
                hoverCircle
                    .attr("cx", paramX_seconds(closestIndex))
                    .attr("cy", paramY(yValue))
                    .style("visibility", "visible");

                d3.select("#tau").property("value", closestIndex).dispatch("input");
            } else {
                hoverCircle.style("visibility", "hidden");
            }
        }, 100)); // Reasonable throttle time

        // Hide the hover circle when mouse/touch leaves
        paramsvg.on("mouseleave touchend", function() {
            hoverCircle.style("visibility", "hidden");
        });

        const xValues = paramX.domain();
        const yValues = paramY.domain();

        const gridSizeX = Math.abs(paramX(xValues[1]) - paramX(xValues[0])) / 8/SECONDS_TO_PLOT; // Width of each cell
        const gridSizeY = Math.abs(paramY(yValues[1]) - paramY(yValues[0])) * 2; // Height of each cell

        let sim_scores = []
        let static_sigma = .4;
        for (let tau_loop = 0; tau_loop <= 80*SECONDS_TO_PLOT; tau_loop += 1) {
            let current_stride_temp_loop = stride_temp_pwl.scale(static_sigma).shift(tau_loop);
            let innerprod_loop = PiecewiseLinear.inner_prod(REAL_ACC_DATA, current_stride_temp_loop);
            sim_scores.push(innerprod_loop);
        }

        // Find peaks in similarity scores
        let peak_indices = []
        for (let i = 0; i < sim_scores.length; i++) {
            let isPeak = true;
            for (let j = Math.max(0, i - 40); j <= Math.min(sim_scores.length - 1, i + 40); j++) {
                if (sim_scores[j] > sim_scores[i]) {
                    isPeak = false;
                    break;
                }
            }
            if (isPeak) {
                peak_indices.push(i);
            }
        }
        console.log(peak_indices);

        // Plot similarity scores
        const simLine = d3.line()
            .x((d, i) => paramX_seconds(i))
            .y(d => paramY(d));

        paramsvg.append("path")
            .datum(sim_scores)
            .attr("fill", "none")
            .attr("stroke", "orange")
            .attr("stroke-width", 2)
            .attr("d", simLine);

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

        let example_template = [-.5, .5, -.5, .5];
        let example_match = [-1, 1, 0, 2];
        let example_nonmatch = [1, -1, 1, 0];

        const exampleX = d3.scaleLinear()
            .domain([0, example_template.length - 1])
            .range([margin.left, width - margin.right]);

        const exampleY = d3.scaleLinear()
            .domain([-1.5, 1.5])  // Expanded domain to include all data points
            .range([height - margin.bottom, margin.top]);

        const exampleXAxis = g => g
            .attr("class", "axis")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(exampleX).ticks(example_template.length).tickSizeOuter(0));

        const exampleYAxis = g => g
            .attr("class", "axis")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(exampleY));

        sim_calc_top_left_svg.attr("viewBox", [0, 0, width, height]);

        sim_calc_top_left_svg.append("g")
            .call(exampleXAxis);

        sim_calc_top_left_svg.append("g")
            .call(exampleYAxis);

        const exampleLine = d3.line()
            .x((d, i) => exampleX(i))
            .y(d => exampleY(d));

        sim_calc_top_left_svg.append("path")
            .datum(example_template)
            .attr("fill", "none")
            .attr("stroke", "var(--plot-line-color-2)")
            .attr("stroke-width", 2)
            .attr("d", exampleLine);

        sim_calc_top_left_svg.append("path")
            .datum(example_match)
            .attr("fill", "none")
            .attr("stroke", "var(--plot-line-color-1)")
            .attr("stroke-width", 2)
            .attr("d", exampleLine);

        sim_calc_bottom_left_svg.attr("viewBox", [0, 0, width, height]);

        sim_calc_bottom_left_svg.append("g")
            .call(exampleXAxis);

        sim_calc_bottom_left_svg.append("g")
            .call(exampleYAxis);

        sim_calc_bottom_left_svg.append("path")
            .datum(example_template)
            .attr("fill", "none")
            .attr("stroke", "var(--plot-line-color-2)")
            .attr("stroke-width", 2)
            .attr("d", exampleLine);

        sim_calc_bottom_left_svg.append("path")
            .datum(example_nonmatch)
            .attr("fill", "none")
            .attr("stroke", "var(--plot-line-color-1)")
            .attr("stroke-width", 2)
            .attr("d", exampleLine);

        function shadeAreaWithTooltip(x1, x2, A, a1, b1, a2, b2, svg) {
            let fill_color;
            if (A < 0) {
                fill_color = "pink";
            } else {
                fill_color = "lightblue";
            }
            const areaData = d3.range(x1, x2 + 0.01, 0.01);
            const areaFunction = d3.area()
            .x(d => exampleX(d))
            .y0(exampleY(0))
            .y1(d => exampleY((a1 * d + b1) * (a2 * d + b2)));

            const areaPath = svg.append("path")
            .datum(areaData)
            .attr("fill", fill_color)
            .attr("opacity", 0.5)
            .lower()
            .attr("d", areaFunction);

            const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "var(--background-color)")
            .style("border", "1px solid black")
            .style("padding", "5px")
            .text(`Similarity Score Contribution: ${A}`);

            // Use mouseenter/mouseleave instead of mouseover/mouseout for better mobile performance
            areaPath
            .on("mouseenter", function(event) {
                tooltip.style("visibility", "visible");
                d3.select(this).attr("opacity", 0.8); // Highlight the area on hover
            })
            .on("mousemove", throttle(function(event) {
                tooltip.style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
            }, 50))
            .on("mouseleave", function() {
                tooltip.style("visibility", "hidden");
                d3.select(this).attr("opacity", 0.5); // Reset the area opacity
            });
        }


        const quadraticFunction1 = d3.line()
            .x(d => exampleX(d))
            .y(d => exampleY((2 * d - 1) * (d - 0.5)));

        const quadraticData1 = d3.range(0, 1.01, 0.01);

        sim_calc_top_right_svg.attr("viewBox", [0, 0, width, height]);

        sim_calc_top_right_svg.append("g")
            .call(exampleXAxis);

        sim_calc_top_right_svg.append("g")
            .call(exampleYAxis);

        sim_calc_top_right_svg.append("path")
            .datum(quadraticData1)
            .attr("fill", "none")
            .attr("stroke", "green")
            .attr("stroke-width", 5)
            .attr("d", quadraticFunction1);

        const quadraticFunction2 = d3.line()
            .x(d => exampleX(d))
            .y(d => exampleY((-d + 2) * (-d + 1.5)));

        const quadraticData2 = d3.range(1, 2.01, 0.01);

        sim_calc_top_right_svg.append("path")
            .datum(quadraticData2)
            .attr("fill", "none")
            .attr("stroke", "green")
            .attr("stroke-width", 5)
            .attr("d", quadraticFunction2);

        const quadraticFunction3 = d3.line()
            .x(d => exampleX(d))
            .y(d => exampleY((2 * d - 4) * (d - 2.5)));

        const quadraticData3 = d3.range(2, 3.01, 0.01);

        sim_calc_top_right_svg.append("path")
            .datum(quadraticData3)
            .attr("fill", "none")
            .attr("stroke", "green")
            .attr("stroke-width", 5)
            .attr("d", quadraticFunction3);

        // Add a dotted line at y = 0
        sim_calc_top_right_svg.append("line")
            .attr("x1", margin.left)
            .attr("x2", width - margin.right)
            .attr("y1", exampleY(0))
            .attr("y2", exampleY(0))
            .attr("stroke", "currentColor")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "4,4");

        sim_calc_top_left_svg.append("text")
            .attr("x", (width / 2))
            .attr("y", height - margin.bottom / 2 - 50)
            .attr("text-anchor", "middle")
            .style("font-size", "24px")
            .style("fill", "currentColor")
            .style("font-family", "sans-serif")
            .text("The peaks and valleys line up, creating a high similarity");

        shadeAreaWithTooltip(0, 1, 0.167, 2, -1, 1, -.5, sim_calc_top_right_svg);
        shadeAreaWithTooltip(1, 1.5, 0.104, -1, 2, -1, 1.5, sim_calc_top_right_svg);
        shadeAreaWithTooltip(1.5, 2, -0.021, -1, 2, -1, 1.5, sim_calc_top_right_svg);
        shadeAreaWithTooltip(2, 2.5, -0.042, 2, -4, 1, -2.5, sim_calc_top_right_svg);
        shadeAreaWithTooltip(2.5, 3, 0.208, 2, -4, 1, -2.5, sim_calc_top_right_svg);

        sim_calc_top_right_svg.append("text")
            .attr("x", (width / 2))
            .attr("y", margin.top / 2 + 30)
            .attr("text-anchor", "middle")
            .style("font-size", "24px")
            .style("fill", "orange")
            .style("font-family", "sans-serif")
            .text("Overall Similarity: 0.417");
        sim_calc_top_right_svg.append("text")
            .attr("x", (width / 2))
            .attr("y", height - margin.bottom / 2 - 75)
            .attr("text-anchor", "middle")
            .style("font-size", "24px")
            .style("fill", "currentColor")
            .style("font-family", "sans-serif")
            .text("Hover Over Shaded Areas to See Similarity Contribution!");

        sim_calc_bottom_right_svg.attr("viewBox", [0, 0, width, height]);

        sim_calc_bottom_right_svg.append("g")
            .call(exampleXAxis);

        sim_calc_bottom_right_svg.append("g")
            .call(exampleYAxis);

        // Add a dashed line at y = 0
        sim_calc_bottom_right_svg.append("line")
            .attr("x1", margin.left)
            .attr("x2", width - margin.right)
            .attr("y1", exampleY(0))
            .attr("y2", exampleY(0))
            .attr("stroke", "currentColor")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "4,4");

        const quadraticFunction4 = d3.line()
            .x(d => exampleX(d))
            .y(d => exampleY((d - 0.5) * (-2 * d + 1)));

        const quadraticData4 = d3.range(0, 1.01, 0.01);

        sim_calc_bottom_right_svg.append("path")
            .datum(quadraticData4)
            .attr("fill", "none")
            .attr("stroke", "green")
            .attr("stroke-width", 5)
            .attr("d", quadraticFunction4);

        const quadraticFunction5 = d3.line()
            .x(d => exampleX(d))
            .y(d => exampleY((-d + 1.5) * (2 * d - 3)));

        const quadraticData5 = d3.range(1, 2.01, 0.01);

        sim_calc_bottom_right_svg.append("path")
            .datum(quadraticData5)
            .attr("fill", "none")
            .attr("stroke", "green")
            .attr("stroke-width", 5)
            .attr("d", quadraticFunction5);

        const quadraticFunction6 = d3.line()
            .x(d => exampleX(d))
            .y(d => exampleY((d - 2.5) * (-d + 3)));

        const quadraticData6 = d3.range(2, 3.01, 0.01);

        sim_calc_bottom_right_svg.append("path")
            .datum(quadraticData6)
            .attr("fill", "none")
            .attr("stroke", "green")
            .attr("stroke-width", 5)
            .attr("d", quadraticFunction6);

        shadeAreaWithTooltip(0, 1, -0.167, 1, -.5, -2, 1, sim_calc_bottom_right_svg);
        shadeAreaWithTooltip(1, 2, -0.167, -1, 1.5, 2, -3, sim_calc_bottom_right_svg);
        shadeAreaWithTooltip(2, 2.5, -0.104, 1, -2.5, -1, 3, sim_calc_bottom_right_svg);
        shadeAreaWithTooltip(2.5, 3, 0.021, 1, -2.5, -1, 3, sim_calc_bottom_right_svg);

        sim_calc_bottom_right_svg.append("text")
            .attr("x", (width / 2))
            .attr("y", margin.top / 2 + 30)
            .attr("text-anchor", "middle")
            .style("font-size", "24px")
            .style("fill", "orange")
            .style("font-family", "sans-serif")
            .text("Overall Similarity: -0.417");
        sim_calc_bottom_right_svg.append("text")
            .attr("x", (width / 2))
            .attr("y", height - margin.bottom / 2 - 75)
            .attr("text-anchor", "middle")
            .style("font-size", "24px")
            .style("fill", "currentColor")
            .style("font-family", "sans-serif")
            .text("Hover Over Shaded Areas to See Similarity Contribution!");

        sim_calc_bottom_left_svg.append("text")
            .attr("x", (width / 2))
            .attr("y", height - margin.bottom / 2 - 50)
            .attr("text-anchor", "middle")
            .style("font-size", "24px")
            .style("fill", "currentColor")
            .style("font-family", "sans-serif")
            .text("Peaks and valleys are opposite, creating a low similarity");

        const exampleData = [0, 2, 3, 2, 0, 2.5, 1, 2, 0];
        
        const peakX = d3.scaleLinear()
            .domain([0, exampleData.length - 1])
            .range([margin.left, width - margin.right]);

        const peakY = d3.scaleLinear()
            .domain([0, 5])
            .range([height - margin.bottom, margin.top]);

        const peakXAxis = g => g
            .attr("class", "axis")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(peakX).ticks(exampleData.length).tickSizeOuter(0));

        const peakYAxis = g => g
            .attr("class", "axis")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(peakY));

        peak_count_ex_svg.attr("viewBox", [0, 0, width, height]);

        peak_count_ex_svg.append("g")
            .call(peakXAxis);

        peak_count_ex_svg.append("g")
            .call(peakYAxis);

        const peakLine = d3.line()
            .x((d, i) => peakX(i))
            .y(d => peakY(d));

        peak_count_ex_svg.append("path")
            .datum(exampleData)
            .attr("fill", "none")
            .attr("stroke", "var(--plot-line-color-1)")
            .attr("stroke-width", 2)
            .attr("d", peakLine);

        peak_count_ex_svg.append("text")
            .attr("x", (width / 2))
            .attr("y", margin.top / 2 + 50)
            .attr("text-anchor", "middle")
            .style("font-size", "24px")
            .style("fill", "currentColor")
            .style("font-family", "sans-serif")
            .text("Peak Counting: Example");
        
        // Check if the wide interval radio input is checked and add a red circle on peak_count_ex_svg
        const wideIntervalRadio = document.querySelector('input[name="interval"][value="wide"]');
        const narrowIntervalRadio = document.querySelector('input[name="interval"][value="narrow"]');

        wideIntervalRadio.addEventListener('change', function() {
            if (this.checked) {
            peak_count_ex_svg.selectAll(".peak-circle").remove();
            peak_count_ex_svg.selectAll(".peak-count").remove();
            peak_count_ex_svg.selectAll("line").remove();
            peak_count_ex_svg.append("circle")
                .attr("class", "peak-circle")
                .attr("cx", peakX(2))
                .attr("cy", peakY(3))
                .attr("r", 5)
                .style("fill", "red");
            peak_count_ex_svg.append("circle")
                .attr("class", "peak-circle")
                .attr("cx", peakX(5))
                .attr("cy", peakY(2.5))
                .attr("r", 5)
                .style("fill", "red");
            peak_count_ex_svg.append("line")
                .attr("x1", peakX(0))
                .attr("x2", peakX(4))
                .attr("y1", peakY(3))
                .attr("y2", peakY(3))
                .attr("stroke", "red")
                .attr("stroke-width", 2);
            peak_count_ex_svg.append("line")
                .attr("x1", peakX(3))
                .attr("x2", peakX(7))
                .attr("y1", peakY(2.5))
                .attr("y2", peakY(2.5))
                .attr("stroke", "red")
                .attr("stroke-width", 2);
            peak_count_ex_svg.append("text")
                .attr("class", "peak-count")
                .attr("x", (width / 2))
                .attr("y", margin.top / 2 + 100)
                .attr("text-anchor", "middle")
                .style("font-size", "24px")
                .style("fill", "currentColor")
                .style("font-family", "sans-serif")
                .text("2 Peaks");
            peak_count_ex_svg.selectAll(".peak-line").remove();
            peak_count_ex_svg.append("line")
                .attr("class", "peak-line")
                .attr("x1", peakX(2))
                .attr("x2", peakX(2))
                .attr("y1", peakY(3))
                .attr("y2", peakY(0))
                .attr("stroke", "red")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "4,4");
            peak_count_ex_svg.append("line")
                .attr("class", "peak-line")
                .attr("x1", peakX(5))
                .attr("x2", peakX(5))
                .attr("y1", peakY(2.5))
                .attr("y2", peakY(0))
                .attr("stroke", "red")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "4,4");
            }
        });

        narrowIntervalRadio.addEventListener('change', function() {
            if (this.checked) {
            peak_count_ex_svg.selectAll(".peak-circle").remove();
            peak_count_ex_svg.selectAll(".peak-count").remove();
            peak_count_ex_svg.selectAll("line").remove();
            peak_count_ex_svg.append("circle")
                .attr("class", "peak-circle")
                .attr("cx", peakX(2))
                .attr("cy", peakY(3))
                .attr("r", 5)
                .style("fill", "red");
            peak_count_ex_svg.append("circle")
                .attr("class", "peak-circle")
                .attr("cx", peakX(5))
                .attr("cy", peakY(2.5))
                .attr("r", 5)
                .style("fill", "red");
            peak_count_ex_svg.append("circle")
                .attr("class", "peak-circle")
                .attr("cx", peakX(7))
                .attr("cy", peakY(2))
                .attr("r", 5)
                .style("fill", "red");
            peak_count_ex_svg.append("line")
                .attr("x1", peakX(1))
                .attr("x2", peakX(3))
                .attr("y1", peakY(3))
                .attr("y2", peakY(3))
                .attr("stroke", "red")
                .attr("stroke-width", 2);
            peak_count_ex_svg.append("line")
                .attr("x1", peakX(4))
                .attr("x2", peakX(6))
                .attr("y1", peakY(2.5))
                .attr("y2", peakY(2.5))
                .attr("stroke", "red")
                .attr("stroke-width", 2);
            peak_count_ex_svg.append("line")
                .attr("x1", peakX(6))
                .attr("x2", peakX(8))
                .attr("y1", peakY(2))
                .attr("y2", peakY(2))
                .attr("stroke", "red")
                .attr("stroke-width", 2);
            peak_count_ex_svg.append("text")
                .attr("class", "peak-count")
                .attr("x", (width / 2))
                .attr("y", margin.top / 2 + 100)
                .attr("text-anchor", "middle")
                .style("font-size", "24px")
                .style("fill", "currentColor")
                .style("font-family", "sans-serif")
                .text("3 Peaks");
            peak_count_ex_svg.selectAll(".peak-line").remove();
            peak_count_ex_svg.append("line")
                .attr("class", "peak-line")
                .attr("x1", peakX(2))
                .attr("x2", peakX(2))
                .attr("y1", peakY(3))
                .attr("y2", peakY(0))
                .attr("stroke", "red")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "4,4");
            peak_count_ex_svg.append("line")
                .attr("class", "peak-line")
                .attr("x1", peakX(5))
                .attr("x2", peakX(5))
                .attr("y1", peakY(2.5))
                .attr("y2", peakY(0))
                .attr("stroke", "red")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "4,4");
            peak_count_ex_svg.append("line")
                .attr("class", "peak-line")
                .attr("x1", peakX(7))
                .attr("x2", peakX(7))
                .attr("y1", peakY(2))
                .attr("y2", peakY(0))
                .attr("stroke", "red")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "4,4");
            }

        });

        // Trigger the event listener to set the initial state
        if (wideIntervalRadio.checked) {
            wideIntervalRadio.dispatchEvent(new Event('change'));
        }
       
        const peakXReal = d3.scaleLinear()
            .domain([0, sim_scores.length - 1])
            .range([margin.left, width - margin.right]);

        const peakXReal_seconds = d3.scaleLinear()
            .domain([0, sim_scores.length/80])
            .range([margin.left, width - margin.right]);

        const peakYReal = d3.scaleLinear()
            .domain(d3.extent(sim_scores))
            .range([height - margin.bottom, margin.top]);
            

        const peakXAxisReal = g => g
            .attr("class", "axis")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(peakXReal_seconds).ticks(sim_scores.length / 80).tickSizeOuter(0));

        const peakYAxisReal = g => g
            .attr("class", "axis")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(peakYReal));

        peak_count_real_svg.attr("viewBox", [0, 0, width, height]);

        peak_count_real_svg.append("g")
            .call(peakXAxisReal);

        peak_count_real_svg.append("g")
            .call(peakYAxisReal);

        const peakLineReal = d3.line()
            .x((d, i) => peakXReal(i))
            .y(d => peakYReal(d));

        peak_count_real_svg.append("path")
            .datum(sim_scores)
            .attr("fill", "none")
            .attr("stroke", "orange")
            .attr("stroke-width", 3)
            .attr("d", peakLineReal);

        peak_count_real_svg.append("text")
            .attr("x", (width / 2))
            .attr("y", margin.top / 2 + 50)
            .attr("text-anchor", "middle")
            .style("font-size", "24px")
            .style("fill", "currentColor")
            .style("font-family", "sans-serif")
            .text("Peak Counting: Real Data");

        peak_count_real_svg.append("text")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .style("text-anchor", "end")
            .style("fill", "currentColor")
            .attr("x", width - margin.right)
            .attr("y", -10)
            .attr("fill", "var(--text-color)")
            .style("font-size", "12px")
            .style("font-family", "sans-serif")
            .text("Time (Seconds)");

        peak_count_real_svg.append("text")
            .attr("transform", `translate(${margin.left},0)`)
            .attr("x", 10)
            .attr("y", margin.top)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .style("font-size", "12px")
            .text("Similarity");

        // Plot circles at each peak index
        peak_count_real_svg.selectAll(".peak-circle")
            .data(peak_indices)
            .enter()
            .append("circle")
            .attr("class", "peak-circle")
            .attr("cx", d => peakXReal(d))
            .attr("cy", d => peakYReal(sim_scores[d]))
            .attr("r", 5)
            .style("fill", "red");

        peak_count_real_svg.append("line")
            .attr("x1", margin.left)
            .attr("x2", width - margin.right)
            .attr("y1", peakYReal(0))
            .attr("y2", peakYReal(0))
            .attr("stroke", "currentColor")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "4,4");

        // Add dashed red lines from each peak to the line at y = 0
        peak_count_real_svg.selectAll(".peak-line")
            .data(peak_indices)
            .enter()
            .append("line")
            .attr("class", "peak-line")
            .attr("x1", d => peakXReal(d))
            .attr("x2", d => peakXReal(d))
            .attr("y1", d => peakYReal(sim_scores[d]))
            .attr("y2", peakYReal(0))
            .attr("stroke", "red")
            .attr("stroke-width", 3)
            .attr("stroke-dasharray", "4,4");

        const accX = d3.scaleLinear()
            .domain([0, values.length - 1])
            .range([margin.left, width - margin.right]);

        const accX_seconds = d3.scaleLinear()
            .domain([0, values.length / 80])
            .range([margin.left, width - margin.right]);

        const accY = d3.scaleLinear()
            .domain([.6, 2])
            .nice()
            .range([height - margin.bottom, margin.top]);

        const accXAxis = g => g
            .attr("class", "axis")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(accX_seconds).ticks(width / 80).tickSizeOuter(0))
            .append("text")
            .attr("x", width - margin.right)
            .attr("y", -10)
            .attr("fill", "var(--text-color)")
            .attr("text-anchor", "end")
            .text("Time (Seconds)");

        const accYAxis = g => g
            .attr("class", "axis")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(accY))
            .append("text")
            .attr("x", 10)
            .attr("y", margin.top)
            .attr("fill", "var(--text-color)")
            .attr("text-anchor", "start")
            .text("Acceleration Magnitude (g)");

        acc_data_with_steps.attr("viewBox", [0, 0, width, height]);

        acc_data_with_steps.append("g")
            .call(accXAxis);

        acc_data_with_steps.append("g")
            .call(accYAxis);

        const accLine = d3.line()
            .x((d, i) => accX(i))
            .y(d => accY(d));

        acc_data_with_steps.append("path")
            .datum(values)
            .attr("fill", "none")
            .attr("stroke", "var(--plot-line-color-1)")
            .attr("stroke-width", 3)
            .attr("d", accLine);

        peak_indices.forEach(index => {
            
            acc_data_with_steps.append("line")
                .attr("x1", accX(index))
                .attr("x2", accX(index))
                .attr("y1", accY(0.6))
                .attr("y2", accY(2))
                .attr("stroke", "var(--plot-line-color-2)")
                .attr("stroke-width", 3)
                .attr("opacity", ".5")
                .attr("stroke-dasharray", "4,4");

            acc_data_with_steps.append("line")
                .attr("x1", accX(index + 80))
                .attr("x2", accX(index + 80))
                .attr("y1", accY(0.6))
                .attr("y2", accY(2))
                .attr("stroke", "var(--plot-line-color-2)")
                .attr("stroke-width", 3)
                .attr("opacity", ".5")
                .attr("stroke-dasharray", "4,4");
        });

        // Elements for peak_count_real_svg mousemove handler
        const closestPeakCircle = peak_count_real_svg.append("circle")
            .attr("class", "closest-peak-circle")
            .attr("r", 10)
            .style("fill", "red")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .style("visibility", "hidden");

        const highlightedStepRect = acc_data_with_steps.append("rect")
            .attr("class", "highlighted-step-rect")
            .attr("fill", "red")
            .attr("opacity", 0.1)
            .style("visibility", "hidden");

        // Simple mousemove handler for peak_count_real_svg - works for both desktop and mobile
        peak_count_real_svg.on("mousemove touchmove", throttle(function(event) {
            const [mouseX] = d3.pointer(event);
            const closestPeakIndex = peak_indices.reduce((prev, curr) => 
                Math.abs(peakXReal(curr) - mouseX) < Math.abs(peakXReal(prev) - mouseX) ? curr : prev
            );

            closestPeakCircle
                .attr("cx", peakXReal(closestPeakIndex))
                .attr("cy", peakYReal(sim_scores[closestPeakIndex]))
                .style("visibility", "visible");
            
            highlightedStepRect
                .attr("x", accX(closestPeakIndex))
                .attr("y", accY(2))
                .attr("width", accX(closestPeakIndex + 80) - accX(closestPeakIndex))
                .attr("height", accY(0.6) - accY(2))
                .style("visibility", "visible");
        }, 100));

        // Hide elements when mouse/touch leaves
        peak_count_real_svg.on("mouseleave touchend", function() {
            closestPeakCircle.style("visibility", "hidden");
            highlightedStepRect.style("visibility", "hidden");
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