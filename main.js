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

let scrollTriggered = false;

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
        .style("font-size", "20px") 
        .style("fill", "var(--text-color)")
        .style("font-family", "sans-serif")
        .text("Similarity between step template and data");

    paramsvg.append("text")
        .attr("x", (width / 2))             
        .attr("y", margin.top / 2 + 30)
        .attr("text-anchor", "middle")  
        .style("font-size", "24px") 
        .style("fill", "var(--text-color)")
        .style("font-family", "sans-serif")
        .text("Hover over the plot to see the template overlay!");

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

        const NUM_OVERLAYS = 5;
        const overlaysContainer = d3.select("#overlay-svg-container")
        let overlayAv = Array(strideTemplateReshaped.length).fill(0);
        let overlaysvgs = []
        const containerWidth = overlaysContainer.node().getBoundingClientRect().width;

        for (let i = 0; i < NUM_OVERLAYS; i++) {
            
            overlaysContainer.append("svg")
                .attr("class", "overlay-svg")
                .attr("id", `overlay-${i}`)
                .attr("width", containerWidth / NUM_OVERLAYS)
                .attr("height", 400)
                .style("display", "inline-block");
            let strideTemplateReshapedCopy = [...strideTemplateReshaped];
            strideTemplateReshapedCopy = strideTemplateReshapedCopy.map((d, i, arr) => 
                (i === 0 || i === arr.length - 1) ? d : d + (Math.random() - 0.5) * 0.2
            );
            overlayAv = overlayAv.map((d, i) => d + strideTemplateReshapedCopy[i]);

            const thisX = d3.scaleLinear()
                .domain([0, strideTemplate.length - 1])
                .range([0, containerWidth / NUM_OVERLAYS]);

            const thisY = d3.scaleLinear()
                .domain([d3.min(strideTemplateReshaped) * 0.9, d3.max(strideTemplateReshaped) * 1.1])
                .range([containerWidth / NUM_OVERLAYS, margin.top]);

            const copyLine = d3.line()
                .x((d, i) => thisX(i))
                .y(d => thisY(d));

            let this_svg = d3.select(`#overlay-${i}`)
            overlaysvgs.push(this_svg);

            this_svg.append("path")
                .datum(strideTemplateReshapedCopy)
                .attr("fill", "none")
                .attr("stroke", "purple")
                .attr("stroke-width", 2)
                .attr("class", "labeled-data")
                .attr("d", copyLine);
        }

        overlayAv = overlayAv.map((d) => d/NUM_OVERLAYS);
        const middleOverlay = overlaysvgs[Math.floor(overlaysvgs.length / 2)];
        const middleOverlayRect = middleOverlay.node().getBoundingClientRect();
        const middleOverlayX = middleOverlayRect.x + middleOverlayRect.width / 2;
        const targetX = middleOverlayX;
        let deltas = [];
        let initials = [];

        overlaysvgs.forEach((svg) => {
            initials.push(svg.node().getBoundingClientRect().x + svg.node().getBoundingClientRect().width / 2);
            deltas.push(targetX - (svg.node().getBoundingClientRect().x + svg.node().getBoundingClientRect().width / 2));
        })

        let scrollCounter = 0;
        let scrollFrozen = false;
        
        // Function to check if scrollytelling should start
        function checkScrollTrigger() {
          const viewportHeight = window.innerHeight;
          const sectionElement = document.getElementById("finding-template");
          const scrollIndicator = document.getElementById('scroll-indicator');
          const textContainer = document.getElementById("overlay-text-container");
          
          // If any of these elements don't exist, we can't proceed
          if (!sectionElement || !scrollIndicator || !overlaysContainer.node() || !textContainer) {
            return;
          }
          
          const sectionRect = sectionElement.getBoundingClientRect();
          const scrollIndicatorRect = scrollIndicator.getBoundingClientRect();
          const textContainerRect = textContainer.getBoundingClientRect();
          
          // Determine if section fits in viewport
          const sectionFitsInViewport = sectionRect.height <= viewportHeight * 0.9;
          
          // Calculate vertical center positions
          const sectionCenter = sectionRect.top + sectionRect.height / 2;
          const viewportCenter = viewportHeight / 2;
          const isCentered = Math.abs(sectionCenter - viewportCenter) < 50;
          
          // For large screens where section fits: ensure section is centered
          // For small screens where section doesn't fit: ensure text and scroll indicator are visible
          let shouldStartScrollytelling = false;
          
          if (sectionFitsInViewport) {
            // Large screen mode: section must be centered
            shouldStartScrollytelling = isCentered;
            console.log("Large screen mode, centered:", isCentered);
          } else {
            // Small screen mode: text and scroll indicator must be visible with bottom padding
            const bottomPadding = 100; // 100px padding from bottom of screen
            shouldStartScrollytelling = 
              textContainerRect.top >= 0 && 
              scrollIndicatorRect.top >= 0 && 
              scrollIndicatorRect.bottom <= viewportHeight - bottomPadding;
            console.log("Small screen mode, text and indicator visible with padding:", shouldStartScrollytelling);
          }
          
          if (!scrollFrozen && !scrollTriggered && shouldStartScrollytelling) {
            scrollFrozen = true;
            
            // Don't change the scroll position at all - just freeze it where it is
            document.body.style.overflow = 'hidden';
            
            // Enable wheel event to track scroll attempts
            window.addEventListener('wheel', handleWheel, { passive: false });
            
            // Show scroll indicator
            if (scrollIndicator) {
              scrollIndicator.classList.add('visible');
            }
            
            console.log("Scrollytelling started", sectionFitsInViewport ? "large screen mode" : "small screen mode");
          }
        }
        
        // Check on scroll
        window.addEventListener('scroll', checkScrollTrigger);
        
        // Also check when the page loads or after a short delay
        setTimeout(checkScrollTrigger, 0);
        
        // Check when window is resized
        let resizeTimeout;
        window.addEventListener('resize', function() {
            // Debounce resize events
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                // If scrollytelling is active and window size changes significantly,
                // we might need to adjust the position
                if (scrollFrozen && !scrollTriggered) {
                    // For now, just check if we should continue with scrollytelling
                    checkScrollTrigger();
                }
            }, 250);
        });
        
        function handleWheel(event) {
            event.preventDefault(); // Stop actual scroll (precaution)
        
            // event.deltaY > 0 => scroll down, < 0 => scroll up
            if (event.deltaY > 0) {
                scrollCounter++;
            } else if (event.deltaY < 0) {
                if (scrollCounter > 0) {
                    scrollCounter--;
                } else {
                    // Allow exiting the scrollytelling when trying to scroll up at the beginning
                    document.body.style.overflow = 'auto';
                    window.removeEventListener('wheel', handleWheel);
                    scrollFrozen = false;
                    
                    // Hide scroll indicator
                    const scrollIndicator = document.getElementById('scroll-indicator');
                    if (scrollIndicator) {
                      scrollIndicator.classList.remove('visible');
                    }
                    return;
                }
            }
        
            const SCROLLNUM = 150;
            if (scrollCounter > SCROLLNUM) {
                document.body.style.overflow = 'auto';
                window.removeEventListener('wheel', handleWheel);
                scrollFrozen = false;
                scrollCounter = SCROLLNUM;
                scrollTriggered = true;
                
                // Hide scroll indicator
                const scrollIndicator = document.getElementById('scroll-indicator');
                if (scrollIndicator) {
                  scrollIndicator.classList.remove('visible');
                }
            }

            let progress = scrollCounter/SCROLLNUM;

            const NUM_SECTIONS = 5;

            const overlayTextContainer = document.getElementById("overlay-text-container");
            
            // Set a fixed height for the text container to prevent jumping
            if (overlayTextContainer && !overlayTextContainer.style.minHeight) {
                // Only set this once to avoid constant resizing
                overlayTextContainer.style.minHeight = "3em";
            }

            // Create a function to update text with fade transition to prevent jumping
            function updateTextWithFade(element, newText, opacity) {
                // Don't change text if it's the same to avoid unnecessary reflows
                if (element.textContent !== newText) {
                    element.textContent = newText;
                }
                element.style.opacity = opacity;
            }

            if (progress <= 1 / NUM_SECTIONS) {
                if (progress <= 1 / 2 / NUM_SECTIONS) {
                    updateTextWithFade(overlayTextContainer, 
                        "First, we start with data from a controlled scientific experiment.",
                        1 - (progress) * NUM_SECTIONS);
                }
                if (progress > 1 / 2 / NUM_SECTIONS) {
                    updateTextWithFade(overlayTextContainer,
                        "Then we mark the starts and ends of each step manually.",
                        2 * (progress - 1 / NUM_SECTIONS / 2) * NUM_SECTIONS);
                }
                overlaysvgs.forEach(svg => {
                    svg.selectAll(".line-dividers").remove();
                    svg.append("line")
                        .attr("x1", svg.node().getBoundingClientRect().width - 1)
                        .attr("x2", svg.node().getBoundingClientRect().width - 1)
                        .attr("y1", 0)
                        .attr("y2", 200)
                        .attr("stroke", "red")
                        .attr("stroke-width", 2)
                        .attr("opacity", progress * NUM_SECTIONS)
                        .attr("class", "line-dividers");
                });
            } else if (progress > 1/NUM_SECTIONS && progress <= 2 / NUM_SECTIONS) {
                if (progress - 1/NUM_SECTIONS <= 1 / 2 / NUM_SECTIONS) {
                    updateTextWithFade(overlayTextContainer,
                        "Then we mark the starts and ends of each step manually.",
                        1 -  (progress - 1/NUM_SECTIONS ) * NUM_SECTIONS);
                }
                if (progress - 1/NUM_SECTIONS  > 1 / 2 / NUM_SECTIONS) {
                    updateTextWithFade(overlayTextContainer,
                        "Then we overlay all the steps. The corresponding points get lined up.",
                        2 * (progress - 1/NUM_SECTIONS  - 1 / NUM_SECTIONS / 2) * NUM_SECTIONS);
                }
            } else if (progress > 2 / NUM_SECTIONS && progress <= 3/NUM_SECTIONS) {
                overlaysvgs.forEach((svg, index) => {
                    let deltaX = deltas[index];
                    svg.attr("transform", `translate(${deltaX * (progress - 2/NUM_SECTIONS) * NUM_SECTIONS}, 0)`);
                    svg.selectAll(".line-dividers").attr("opacity", 1 - (progress - 2/NUM_SECTIONS)*NUM_SECTIONS);
                });
            } else if (progress > 3 / NUM_SECTIONS && progress <= 4/NUM_SECTIONS) {
                if (progress - 3/NUM_SECTIONS <= 1 / 2 / NUM_SECTIONS) {
                    updateTextWithFade(overlayTextContainer,
                        "Then we overlay all the steps. The corresponding points get lined up.",
                        1 -  (progress - 3/NUM_SECTIONS ) * NUM_SECTIONS);
                }
                if (progress - 3/NUM_SECTIONS  > 1 / 2 / NUM_SECTIONS) {
                    updateTextWithFade(overlayTextContainer,
                        "Then we average out all the data from corresponding points.",
                        2 * (progress - 3/NUM_SECTIONS  - 1 / NUM_SECTIONS / 2) * NUM_SECTIONS);
                }
            } else if (progress > 4 / NUM_SECTIONS && progress <= 1){
                overlaysvgs.forEach((svg, index) => {
                    svg.select(".labeled-data").attr("opacity", 1 - (progress - 4/NUM_SECTIONS) * NUM_SECTIONS);
                })
                
                const overlayX = d3.scaleLinear()
                    .domain([0, overlayAv.length - 1])
                    .range([0, containerWidth / NUM_OVERLAYS]);

                const overlayY = d3.scaleLinear()
                    .domain([d3.min(overlayAv) * 0.9, d3.max(overlayAv) * 1.1])
                    .range([containerWidth/NUM_OVERLAYS, margin.top]);

                const overlayLine = d3.line()
                    .x((d, i) => overlayX(i))
                    .y(d => overlayY(d));

                if (progress - 4/NUM_SECTIONS <= 1 / 2 / NUM_SECTIONS) {
                    updateTextWithFade(overlayTextContainer,
                        "Then we average out all the data from corresponding points.",
                        1 - (progress - 4/NUM_SECTIONS) * NUM_SECTIONS);
                }
                if (progress - 4/NUM_SECTIONS > 1 / 2 / NUM_SECTIONS) {
                    updateTextWithFade(overlayTextContainer,
                        "And we get a template for what a step looks like in acceleration data!",
                        2 * (progress - 4/NUM_SECTIONS - 1 / NUM_SECTIONS / 2) * NUM_SECTIONS);
                }

                middleOverlay.append("path")
                    .datum(overlayAv)
                    .attr("fill", "none")
                    .attr("stroke", "var(--plot-line-color-2)")
                    .attr("stroke-width", 2)
                    .attr("opacity", (progress - 4/NUM_SECTIONS) *NUM_SECTIONS)
                    .attr("d", overlayLine);
            }

        }
        
        


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

        // Add axis labels - repositioned to match the first plot
        template_svg.append("text")
            .attr("x", margin.left + 350)
            .attr("y", height - margin.bottom - 10)
            .attr("fill", "var(--text-color)")
            .attr("text-anchor", "end")
            .style("font-size", "12px")  
            .text("Time (Seconds)");
            
        // Add y-axis label - repositioned to match the first plot
        template_svg.append("text")
            .attr("x", 50)
            .attr("y", margin.top)
            .attr("fill", "var(--text-color)")
            .attr("text-anchor", "start")
            .style("font-size", "12px")
            .attr("text-anchor", "start")
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
        }, 0)); // Reasonable throttle time

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
                .style("font-size", "30px")
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
                // .style("font-size", "12px")
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
            }, 0))
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
            .attr("y", margin.top / 2 + 30)
            .attr("text-anchor", "middle")
            .style("font-size", "24px")
            .style("fill", "currentColor")
            .style("font-family", "sans-serif")
            .text("Peak Counting: Hover to see the corresponding step!");

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
        }, 0));

        // Hide elements when mouse/touch leaves
        peak_count_real_svg.on("mouseleave touchend", function() {
            closestPeakCircle.style("visibility", "hidden");
            highlightedStepRect.style("visibility", "hidden");
        });
    });

    // Apply theme colors to SVG elements
    updateSvgColors();

    const canvas = document.getElementById('drawCanvas');
    const ctx = canvas.getContext('2d');
    
    // Get the actual CSS size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    
    
    // Now mouse coordinates match perfectly
    
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let canDraw = true;

    let xCoordinates = [];
    let yCoordinates = [];

    const buttonContainer = document.getElementById('button-container');

    const clearButton = document.createElement('button');
    clearButton.textContent = "Clear Canvas";
    clearButton.style.padding = "5px 10px";
    clearButton.style.fontSize = "14px";
    clearButton.style.cursor = "pointer";
    buttonContainer.appendChild(clearButton);

    clearButton.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        xCoordinates = [];
        yCoordinates = [];
        canDraw = true;
        const errorBox = document.getElementById('error-box');
        if (errorBox) {
            buttonContainer.removeChild(errorBox);
        }
        // Clear the SVG overlay
        d3.select("svg.canvas-overlay").remove();
        const proceedButton = document.getElementById('proceed-button');
        if (proceedButton) {
            buttonContainer.removeChild(proceedButton);
        }
        const simButton = document.getElementById("similarity-button");
        if (simButton) {
            buttonContainer.removeChild(simButton);
        }
        const peakButton = document.getElementById("find-peaks-button");
        if (peakButton) {
            buttonContainer.removeChild(peakButton);
        }        
    });

    function handleDrawInput(){
        if (!d3.select("svg.canvas-overlay").empty()) {
            return;
        }
        const overlaySvg = d3.select(canvas.parentElement)
            .append("svg")
            .attr("class", "canvas-overlay")
            .attr("width", canvas.width)
            .attr("height", canvas.height)
            .style("position", "absolute")
            .style("top", canvas.offsetTop + "px")
            .style("left", canvas.offsetLeft + "px")
            .style("pointer-events", "none");

        if (!xCoordinates.every((val, i, arr) => i === 0 || val >= arr[i - 1])) {
            // Display error message
            const errorBox = document.createElement('div');
            errorBox.textContent = "Error: Please draw strictly left to right";
            errorBox.style.color = "red";
            errorBox.style.fontSize = "16px";
            errorBox.style.fontFamily = "Arial, sans-serif";
            errorBox.id = "error-box";
            buttonContainer.appendChild(errorBox);

        } else {
            // Remove duplicates from xCoordinates and corresponding yCoordinates
            let uniqueCoordinates = [];
            xCoordinates.forEach((x, index) => {
                if (!uniqueCoordinates.includes(x)) {
                    uniqueCoordinates.push(x);
                } else {
                    xCoordinates.splice(index, 1);
                    yCoordinates.splice(index, 1);
                }
            });


            let xCoordsShifted = xCoordinates.map(x => x - xCoordinates[0]);
            let yCoordsShifted = yCoordinates.map(x => - x);
            const SCALE_FAC = 80 / xCoordsShifted.length;
            let custom_pattern = new PiecewiseLinear(xCoordsShifted, yCoordsShifted);
            const customX = d3.scaleLinear()
                .domain([0, canvas.width])
                .range([canvas.width / 10, canvas.width * 9/10]);

            const customY = d3.scaleLinear()
                .domain([-canvas.height, 0])
                .range([canvas.height * 9/ 10, canvas.height / 10]);



            // Add a text box and button to the overlay
            const textBox = overlaySvg.append("text")
                .attr("x", canvas.width - 100)
                .attr("y", canvas.height - 20)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("fill", "black")
                .attr("id", "proceed-text")
                .text("Proceed with this pattern?");

            const button = document.createElement("button");
            button.textContent = "Proceed";
            button.style.padding = "10px 20px";
            button.style.fontSize = "16px";
            button.style.cursor = "pointer";
            button.style.position = "absolute";
            button.style.top = `${canvas.offsetTop + canvas.height + 10}px`;
            button.style.left = `${canvas.offsetLeft + canvas.width - 50}px`;
            button.style.transform = "translateX(-50%)";
            button.id = "proceed-button";
            buttonContainer.appendChild(button);

            button.addEventListener("click", () => {
                // Clear the canvas and remove the overlay SVG
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                xCoordinates = [];
                yCoordinates = [];
                buttonContainer.removeChild(button);
                // Remove the text box
                overlaySvg.select("#proceed-text").remove();
                overlaySvg.append("text")
                    .attr("x", canvas.width / 2)
                    .attr("y", canvas.height / 10)
                    .attr("text-anchor", "middle")
                    .style("font-size", "30px")
                    .style("fill", "black")
                    .text("Your pattern:");
                custom_pattern.plot(overlaySvg, customX, customY, "var(--plot-line-color-2)");
                addSimButton(overlaySvg, buttonContainer, canvas, custom_pattern, REAL_ACC_DATA);
            });

            
        }
        
    }

    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
        xCoordinates.push(lastX);
        yCoordinates.push(lastY);
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing || !canDraw) return;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        [lastX, lastY] = [e.offsetX, e.offsetY];
        xCoordinates.push(lastX);
        yCoordinates.push(lastY);
    });
    
    canvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      [lastX, lastY] = [e.offsetX, e.offsetY];
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing || !canDraw) return;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        [lastX, lastY] = [e.offsetX, e.offsetY];
    });
    
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseout', () => isDrawing = false);
    
    ctx.strokeStyle = '#000';

    canvas.addEventListener('mouseup', () => {
        isDrawing = false;
        canDraw = false;
        handleDrawInput();
    });
    canvas.addEventListener('mouseout', () => {
        isDrawing = false;
        canDraw = false;
        handleDrawInput();
    });
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    

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

function addSimButton(overlaySvg, buttonContainer, canvas, custom_pattern, REAL_ACC_DATA) {
    const textBox = overlaySvg.append("text")
        .attr("x", canvas.width - 250)
        .attr("y", canvas.height - 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "black")
        .attr("id", "similarity-text")
        .text("Click here to see the similarity between your pattern and the data");
    const button = document.createElement("button");
    button.textContent = "See Similarity";
    button.style.padding = "10px 20px";
    button.style.fontSize = "16px";
    button.style.cursor = "pointer";
    button.style.position = "absolute";
    button.style.top = `${canvas.offsetTop + canvas.height + 10}px`;
    button.style.left = `${canvas.offsetLeft + canvas.width - 50}px`;
    button.style.transform = "translateX(-50%)";
    button.id = "similarity-button";
    buttonContainer.appendChild(button);

    button.addEventListener("click", () => {
        patternToSim(overlaySvg, buttonContainer, canvas, custom_pattern, REAL_ACC_DATA);
    });
}

function patternToSim(overlaySvg, buttonContainer, canvas, custom_pattern, REAL_ACC_DATA) {
    overlaySvg.selectAll("path").remove();
    const simButton = document.getElementById("similarity-button");
    if (simButton) {
        buttonContainer.removeChild(simButton);
    }
    overlaySvg.selectAll("text").remove();
    let scaled_custom_pattern = custom_pattern.scale(160 / canvas.width);
    let yCoordsToChange = scaled_custom_pattern.y;
    const meanY = d3.mean(yCoordsToChange);
    const minY = d3.min(yCoordsToChange);
    const maxY = d3.max(yCoordsToChange);
    const rangeY = maxY - minY;

    yCoordsToChange = yCoordsToChange.map(y => ((y - meanY) / rangeY) * 4);
    let scaled_again = new PiecewiseLinear(scaled_custom_pattern.x, yCoordsToChange);

    let similarityScores = [];


    for (let i = 0; i < REAL_ACC_DATA.x.length; i++) {
        let shiftedPattern = scaled_again.shift(REAL_ACC_DATA.x[i]);
        let similarity = PiecewiseLinear.inner_prod(REAL_ACC_DATA, shiftedPattern);
        similarityScores.push(similarity);
    }

    
    
    // Log or process similarityScores as needed
    const simX = d3.scaleLinear()
        .domain([0, similarityScores.length - 1])
        .range([0, canvas.width]);

    const simY = d3.scaleLinear()
        .domain([Math.min(-20, d3.min(similarityScores)) - 5, Math.max(20, d3.max(similarityScores)) + 5])
        .range([canvas.height, 0]);

    const simLine = d3.line()
        .x((d, i) => simX(i))
        .y(d => simY(d));

    overlaySvg.append("line")
        .attr("x1", 0)
        .attr("x2", canvas.width)
        .attr("y1", simY(-15))
        .attr("y2", simY(-15))
        .attr("stroke", "red")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4,4")
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .style("opacity", 1);

    overlaySvg.append("text")
        .attr("x", 10)
        .attr("y", simY(-15) - 5)
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .style("fill", "red")
        .text("Lowest similarity between data and real pattern")
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .style("opacity", 1);

    overlaySvg.append("line")
        .attr("x1", 0)
        .attr("x2", canvas.width)
        .attr("y1", simY(15))
        .attr("y2", simY(15))
        .attr("stroke", "red")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4,4")
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .style("opacity", 1);

    overlaySvg.append("text")
        .attr("x", 10)
        .attr("y", simY(15) - 5)
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .style("fill", "red")
        .text("Highest similarity between data and real pattern")
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .style("opacity", 1);

    overlaySvg.append("path")
        .datum(similarityScores)
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", 2)
        .attr("d", simLine)
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .style("opacity", 1);

    const findPeaksButton = document.createElement("button");
    findPeaksButton.textContent = "Find Peaks";
    findPeaksButton.style.padding = "10px 20px";
    findPeaksButton.style.fontSize = "16px";
    findPeaksButton.style.cursor = "pointer";
    findPeaksButton.style.position = "absolute";
    findPeaksButton.style.top = `${canvas.offsetTop + canvas.height + 10}px`;
    findPeaksButton.style.left = `${canvas.offsetLeft + canvas.width - 50}px`;
    findPeaksButton.style.transform = "translateX(-50%)";
    findPeaksButton.id = "find-peaks-button";
    buttonContainer.appendChild(findPeaksButton);

    const textBox = overlaySvg.append("text")
        .attr("x", canvas.width - 150)
        .attr("y", canvas.height - 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "black")
        .attr("id", "find-peaks-text")
        .text("Click here to find the number of steps");

    findPeaksButton.addEventListener("click", () => {
        findPeaks(scaled_again, similarityScores, overlaySvg, simX, simY, canvas);
    });
}

function findPeaks(scaled_again, similarityScores, overlaySvg, simX, simY, canvas) {
    const halfIntervalWidth = Math.round(Math.max(...scaled_again.x) / 2);
    let peaks = [];
    for (let i = 0; i < similarityScores.length; i++) {
        let isPeak = true;
        for (let j = Math.max(0, i - halfIntervalWidth); j <= Math.min(similarityScores.length - 1, i + halfIntervalWidth); j++) {
            if (similarityScores[j] > similarityScores[i]) {
                isPeak = false;
                break;
            }
        }
        if (isPeak) {
            peaks.push(i);
        }
    }
    

    // Add lines to each peak circle to show the interval width
    overlaySvg.selectAll(".peak-line")
        .data(peaks)
        .enter()
        .append("line")
        .attr("class", "peak-line")
        .attr("x1", d => simX(d - halfIntervalWidth))
        .attr("x2", d => simX(d + halfIntervalWidth))
        .attr("y1", d => simY(similarityScores[d]))
        .attr("y2", d => simY(similarityScores[d]))
        .attr("stroke", "red")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4,4")
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .style("opacity", 1);

    overlaySvg.selectAll(".peak-circle")
        .data(peaks)
        .enter()
        .append("circle")
        .attr("class", "peak-circle")
        .attr("cx", d => simX(d))
        .attr("cy", d => simY(similarityScores[d]))
        .attr("r", 5)
        .style("fill", "red")
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .style("opacity", 1);

    overlaySvg.append("text")
        .attr("x", canvas.width / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .style("fill", "black")
        .text(`Number of Steps Found: ${peaks.length}`);
    overlaySvg.append("text")
        .attr("x", canvas.width / 2)
        .attr("y", 50)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("fill", "black")
        .text(`Interval width: ${halfIntervalWidth * 2 / 80} seconds`);
}