import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';


export class PiecewiseLinear {
    /* Defines class for piecewise linear functions given a list of points
    and an index. The idea is that it linearly interpolates between the
    given points and lets you evaluate at any point.
    */

    // Constructor takes in x, an array of x values and y, an array of y values
    // The x values are the points where it switches to a different linear function
    constructor(x, y) {
        if (!Array.isArray(x)) {
            throw new Error('x must be an array');
        }
        if (!Array.isArray(y)) {
            throw new Error('y must be an array');
        }
        if (x.length != y.length) {
            throw new Error('x and y must be the same length');
        }
        this.x = x;
        this.y = y;
        this.map = new Map();
        for (let i = 0; i < x.length; i++) {
            this.map.set(x[i], y[i]);
        }
    }


    // Evaluates the piecewise linear function at a given x value
    // Simply returns the corresponding hashmap value if x was one of the
    // Hinge points used to define the function in the first place
    // Otherwise linearly interpolates between nearest points
    // If given point is outside defined domain, will return 0
    eval_at(x0) {
        if (this.map.has(x0)) {
            return this.map.get(x0);
        }
        if (this.x[0] > x0) {
            return 0;
        }
        if (this.x.at(-1) < x0) {
            return 0;
        }
        let idx = 0;
        while (this.x[idx] < x0) {
            idx = idx + 1;
        }
        let x2 = this.x[idx];
        let x1 = this.x[idx - 1];
        let y2 = this.y[idx];
        let y1 = this.y[idx - 1];

        return (y2 - y1) / (x2 - x1)*(x0 - x1) + y1;
    }

    plot(svg, xScale, yScale, color = "var(--plot-line-color-2)", cls = "") {
        const dataPoints = this.x.map((xVal, i) => ({
            x: xVal,
            y: this.y[i]
        }));
          
          // Line generator
        const lineGen = d3.line()
            .x(d => xScale(d.x))  // Map x using the same xScale
            .y(d => yScale(d.y)); // Map y using the same yScale
          
          // Append function plot
        svg.append("path")
            .datum(dataPoints)
            .attr("d", lineGen)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("class", cls);
    }

    shift(tau) {
        let shifted_x = this.x.map((x) => x + tau);
        return new PiecewiseLinear(shifted_x, this.y);
    }

    scale(sigma) {
        let shift_val = this.x[0]
        let shifted_x = this.x.map((x) => x - shift_val); 
        let scaled_x = shifted_x.map((x) => x * sigma);
        let output_x = scaled_x.map((x) => x + shift_val);
        return new PiecewiseLinear(output_x, this.y);
    }

    // Calculates the integral of a segment of the product
    // Formula is derivable because its just two lines for this segment
    static integrate_product_segment(x1, x2, f, g) {
        let f1 = f.eval_at(x1);
        let f2 = f.eval_at(x2);
        let g1 = g.eval_at(x1);
        let g2 = g.eval_at(x2);

        let m1 = (f2 - f1) / (x2 - x1);
        let m2 = (g2 - g1) / (x2 - x1);

        let a = m1*m2*(1/3 * x2**3 - 1/3 * x1**3 - x1*(x2**2) + (x1**2)*x2);
        let b = (m1*g1 + m2*f1)*(1/2 * x2**2 + 1/2 * x1**2 - x1*x2);
        let c = f1*g1*(x2 - x1);


        return a + b + c;
    }

    // Calculates inner product between two piecewise linears
    // Adds segment by segment integral
    static inner_prod(f1, f2) {
        let f1x = f1.x.slice();
        let f2x = f2.x.slice();
        let i = 0, j = 0;
        let ordered_partition = [];
        while (i < f1x.length && j < f2x.length) {
            if (f1x[i] < f2x[j]) {
                if (ordered_partition.at(-1) != f1x[i]) {
                    ordered_partition.push(f1x[i]);
                } 
                i++;
            } else {
                if (ordered_partition.at(-1) != f2x[i]) {
                    ordered_partition.push(f2x[j]);
                }
                j++;
            }
        }
        
        while (i < f1x.length) {
            if (ordered_partition.at(-1) != f1x[i]) {
                ordered_partition.push(f1x[i]);
            } 
            i++;
        }
        
        while (j < f2x.length) {
            if (ordered_partition.at(-1) != f2x[i]) {
                ordered_partition.push(f2x[j]);
            }
            j++;
        }

        let segment_sum = 0;

        for (let idx = 0; idx < ordered_partition.length - 1; idx++) {
            segment_sum += PiecewiseLinear.integrate_product_segment(ordered_partition[idx], ordered_partition[idx + 1], f1, f2);
        }

        return segment_sum;
    }
}

// let test1 = new PiecewiseLinear([0, 1, 2, 3], [0, 1, .5, .75]);
// let test2 = new PiecewiseLinear([0, 1.5, 3], [1, -.5, .25]);

// console.log(PiecewiseLinear.inner_prod(test1, test2));
// console.log(test1.eval_at(-1));