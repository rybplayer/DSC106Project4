![Banner](https://github.com/rybplayer/DSC106Project4/blob/main/model/thumbnail.png)

![Banner](https://github.com/rybplayer/DSC106Project4/blob/main/model/ProjectBanner.png)

# How does a phone 📱 count your steps? 🚶‍➡️🚶‍♀️‍➡️

Names:
- Ryan Batubara, rbatubara (at) ucsd (dot) edu
- Isaiah Fang, ifang (at) ucsd (dot) edu
- Matt Tokunaga, m2tokunaga (at) ucsd (dot) edu

**[Link to Visual](https://rybplayer.github.io/DSC106Project4/)**

**[Link to GitHub Repository](https://github.com/rybplayer/DSC106Project4)**

**[Link to Write-Up](https://docs.google.com/document/d/1dcNWIovDCFFSPvu0TG_53hivtJetcSnDsji9FEgcgK4/edit?usp=sharing)**

## Tabel of Contents
- [How does a phone 📱 count your steps? 🚶‍➡️🚶‍♀️‍➡️](#how-does-a-phone--count-your-steps-️️️)
    - [Table of Contents](#tabel-of-contents)
    - [Table of Contents](#abstract)
    - [A Remark on Design Rational](#a-remark-on-design-rational)
    - [Visuals & Techniques](#visuals--techniques)
    - [Data Transformations](#data-transformations)
    - [Ethical Considerations](#ethical-considerations)
    - [Development Process & Time Management](#development-process--time-management)

## Abstract
[Back to Table of Contents](#tabel-of-contents)

Have you ever wondered how your phone can count your steps? You could probably execute this task yourself! The average person would consider each foot-to-floor contact as a step. But how would a computer do it? Modern digital phones and watches record health summaries on step counts using their own algorithm. We use data science and mathematical methods in our visualization project to venture the curiosity of how computers measure step counts.

Our project aims to help viewers explore an example algorithm that computers use to count human steps. We use a [Physionet](https://physionet.org/content/minute-level-step-count-nhanes/1.0.0/) dataset containing accelerometer data recorded on the wrist-activity tracker: ActiGraph GT3X+. Pushing the data through a Continuous Wavelet Transform (CWT), we are given minute-level step counts. The visualization focuses on displaying our findings in an engaging and meaningful way. Here is an interaction flowchart for our visual:

1. Viewer opens the page and reads the title and subtitle containing author names and links to the writeup, data, and original paper. The transitions of the website are all motivated by scrolling and various text instructions are provided to urge the viewer to interact with our graphs.
2. Next, a walking-figure animation with an interactive play/pause button and speed slider encourages the viewer to experiment with how they would count steps.
3. The website transitions to talk about how a computer would count steps using acceleration magnitude data over an extended period of time (with an example graph). It provides an example of what a step would look like (with an example graph). The visualization makes a point that step counting is now a similarity problem where the computer is identifying where the example step appears in the extended period of time.
4. An interactive mini-lecture on similarity appears to aid the viewer’s understanding of similarity calculations. Viewers have the ability to hover over the area under the provided curve where a tooltip on “Similarity Score Contribution” will pop up.
5. Going back to the acceleration magnitude data over an extended period of time, viewers now have the ability to hover over a corresponding similarity curve (which simultaneously shifts an overlaid example step across a acceleration magnitude) to get a better understanding of how computers use similarity to count steps.
6. Continuing onwards, the website introduces the idea that the similarity problem is really a peak counting problem. Toggle buttons for “Wide Interval” and “Narrow Interval” that correspond to a following graph are provided for the viewer to engage with so that they can understand how similarity peaks are considered.
7. Next, an interactive graph with labeled peaks on a similarity curve encourages the viewer to hover over the peaks/step-intervals to make the connection that peaks in the similarity curve correspond to steps.
8. The website visualization ends with a quick summary of its purpose. By all these interactive and scrollytelling processes, the viewer becomes familiar with how computers count steps and better understands an example algorithm of using similarity with acceleration magnitude data.

## A Remark on Design Rationale
[Back to Table of Contents](#tabel-of-contents)

We wanted to explore a non-trivial dataset that we could explore that would effectively create a meaningful and interactive story. We first came together to create a vision board to discuss potential datasets and what we wanted our visualization to look like:

![Banner](https://github.com/rybplayer/DSC106Project4/blob/main/model/fig1.jpg)

<p align='center'><b>Figure 1: Initial Vision Board</b></p>

We found that accelerometer data and mathematical algorithms were very interesting topics, but could be difficult to communicate on a website. Because the dataset provided accelerometer data from a wrist activity tracker, we had to decide on which algorithm to use for our main data transformation. After researching potential methods, we landed on Continuous Wavelet Transform (CWT). For our project proposal, we tested out some Exploratory Data Analysis (EDA) plots and liked what we created:

![Banner](https://github.com/rybplayer/DSC106Project4/blob/main/model/fig2_1.png)
![Banner](https://github.com/rybplayer/DSC106Project4/blob/main/model/fig2_2.png)

<p align='center'><b>Figure 2: Initial EDA Plots</b></p>

There were several alternative ideas that we heavily considered, so many of our original ideas were scrapped. We were immersed into the idea of creating a complicated transition and math-heavy visualization, but realized that our audience would have a difficult time understanding the message. Although we had the correct idea with visualizing accelerometer data, we encountered a brief mental block on how to structure our website. CWT is a complicated algorithm that required mathematical analysis to understand. Eventually, we landed on our first attempt at creating a somewhat buggy and mathematically intriguing visualization:

![Banner](https://github.com/rybplayer/DSC106Project4/blob/main/model/fig3.png)

<p align='center'><b>Figure 3: Initial Sketch on the Website</b></p>

After accumulating some feedback on this and past projects, we went back to the drawing board and revamped our vision:

![Banner](https://github.com/rybplayer/DSC106Project4/blob/main/model/fig4_1.jpg)
![Banner](https://github.com/rybplayer/DSC106Project4/blob/main/model/fig4_2.jpg)

<p align='center'><b>Figure 4: Revamped Vision Board</b></p>

We realized that we could simplify the interactive visualization so it would be mathematically digestible for our viewers. One of the biggest implementations we focused on was providing text segments (either on content or instructions to interact) for the viewer to follow along. After a lot of debugging and new iterations, we settled on a final design that contained mini-lectures and multiple interactive visualizations to aid the viewer in this experience.

![Banner](https://github.com/rybplayer/DSC106Project4/blob/main/model/fig5.png)

<p align='center'><b>Figure 5: (One of many) Interactive Visualizations of our Final Design</b></p>

## Visuals & Techniques
[Back to Table of Contents](#tabel-of-contents)

We believe the above flow chart is effectively carried out using the following techniques:

**Header:** Our main research question is bolded at the top as an initial introduction to our project. It is kept short and simple to catch the viewer’s attention.

**Header’s Subtitle:** Gives information about the authors, this write-up, and data source (so that the user can have a general understanding of the website).

**Scrollying:** The website is structured with scrollytelling so that the viewer can learn about step counting in an orderly fashion. Each section of the website smoothly transitions as you progress with the scrolling function.

**Subtitles:** Gives an introduction to what the following section will be covering and prompts the user to interact with the visual (if labeled as interactive).

**Color:** We chose a distinct color palette to help our audience members differentiate between acceleration over an time period, example step acceleration, and similarity curves. Colors are intentionally bright to create a welcoming and visually distinguishable feel.

**Hover/Tooltips:** Hover mechanisms are integrated into some of the website’s graphs to aid the viewer experience. Many of the hover-able graphs have a corresponding graph that updates accordingly after each hover movement. A tooltip shows up in the similarity integral section whenever the area under the green curve is hovered. This interaction motivates the user to spend time hovering and understanding how similarity is calculated. Furthermore, this adds specificity to the plot and increases the credibility that this is not a deceptive visualization.

**Animation:** An initial animation of a [figure](https://ordinary-bumblebee.itch.io/8-direction-walk-cycle) walking, with a play/pause button and speed slider, is provided at the beginning of the website. The animation sprite sheet is licensed under CCO, so we can modify the sprites for any purposes without restriction. This interaction is the first eye-opening opportunity for the viewer to ease into the world of step counting. Animation adds a visual movement effect to the viewer’s experience and they are inclined to engage with the animation.

**Minimal Line Graphs:** Line Graphs are designed to be simple, but meaningful with labeled axis and content.

**Notes:** Text throughout the website aids the viewer in understanding step counting and urges interaction. The math behind the algorithm is explained through text and motivated interaction.

**Interval Toggle:** A toggle for Wide and Narrow interval is provided in one of the segments of our website to help the viewer understand similarity peaks. This technique is one of the many other techniques mentioned to help the viewer understand many aspects of the data.

**Dark Mode:** Lastly, the light/dark mode toggle is added for a fun user experience. This has the added side benefit of increasing user comfort since it will take some time to play out all the animations and try all combinations of exams.

## Data Transformations
[Back to Table of Contents](#tabel-of-contents)

Most of our data is transformed visually, through animations, color, other visual channels, and algorithms. We have integrated various data transformations to help further our data science story:

The first transformation we did was to turn acceleration in each direction into one overall acceleration magnitude. This is what the researchers did as well. We believe there are two main advantages to this. First, univariate data is just easier to work with than multivariate data. Secondly, you have no guarantees about the orientation of the measurement device, so there’s really no meaning to the individual acceleration numbers. Therefore you want to turn the acceleration data into a single variable in a symmetric way that retains some meaning, and acceleration magnitude fits those criteria. The formula is:

![Banner](https://github.com/rybplayer/DSC106Project4/blob/main/model/fig6.png)

Here M is the acceleration magnitude. The a variables are acceleration in the x, y, and z directions respectively.

The other main way we transformed our data was turning the raw accelerometer data into similarity scores. We found similarity by computing the L2 inner product between our raw data and a step pattern that was provided by the researchers. The details are explained on the website. To transform this (basically) continuous data into discrete steps, we used a very simple peak counting algorithm. The algorithm consists of finding all data points that are local peaks. This algorithm was not described in the research paper and was thought of independently, although we do not claim that the algorithm is unique in the slightest, just that we do not guarantee that this is what the researchers used.

## Ethical Considerations
[Back to Table of Contents](#tabel-of-contents)

Step counting is a statistic in modern mobile digital devices so it is important to be ethically responsible in representing our data. We decided to show this ethical consideration in three ways:

**1. Earnest visualization:** We wanted to show as many aspects of the data as possible. We did this by slowly, but effectively, with the integration of scrollytelling. Each section of the website tries to engage the viewer into understanding different aspects of the data. We repeatedly focus on acceleration magnitude and similarity graphs with the hope that viewers will realize that we have no intention of misrepresenting the data. This is important for a twofold reason: First, it respects the people who wore the accelerometer for the study, and second, it respects the viewer’s time by making sure they get a good, honest view of the data.

**2. Interaction:** In our interaction we ask the user to follow along with each segment of the website (through scrollytelling). Our hope is that this encourages the viewer to learn and think critically: how can similarity be used to see if acceleration points to a step? In doing so, we ask the viewer to ask what is an ethical conclusion from this data. We try to repeat graphs, but with a new aspect and interaction so that viewers can have a full grasp on what they are learning. This critical thinking encourages the viewer to be more aware of the ethical implications of studies like this and how they have the potential to educate (or misinform!) accordingly.

**3. Ask, not tell:** After the user scrolls through the website, they are presented less so with answers but more with questions. This helps reduce our personal bias in analyzing the data. Instead, by making the user familiar with the data through interaction and providing guiding questions, the hope is that the user becomes more familiar than ever before with the ethical considerations at play in the visual. In particular, the new question of “what if the accelerometer tracker were on a different parts of the body” should come with skepticism to the viewer after learning how we used similarity to identify a step. This helps the viewer further engage in the sensitive discussion of accelerometer data in a much more educated and well-informed manner.

## Development Process & Time Management
[Back to Table of Contents](#tabel-of-contents)

The development process of Project 4 was thoroughly conducted in the span of three weeks (around 60-man hours total). While we used these hours to brainstorm, vision-board, and program, the majority of our time was spent on programming an audience-friendly website. All three team members (Ryan, Isaiah, and Matt) put in the effort to discuss and execute the vision for our project.

The project began with all members carefully reviewing potential datasets for something non-trivial, fun, and deliverable as a website. We met together in a classroom to visually discuss our ideas with a chalk and a blackboard. The minute level step counts dataset from Physionet was one of the few potential datasets that we were interested in exploring. After sketching out potential visions on how we would utilize the data, we discussed what kinds of graphs would be most purposeful. We ended up overcomplicating our initial visualizations because we found it difficult to simplify the complex algorithm behind step counting. Brushing this problem aside, we created an interactive visualization on acceleration magnitude with an overlaid example step acceleration. But it was too mathematically complicated for the average viewer to understand…

The project proposal and initial prototype gave us opportunities to experiment with different ideas and have time to receive feedback from both peers and staff. These two “checkpoints” helped keep our project on track and write down our upcoming priorities. One of the top priorities was to simplify the delivery of our message. Thankfully, we found a way to defeat the difficult-to-understand algorithm issue by focusing the viewer to learn about similarity. We relied on scrollytelling to incrementally walk the viewer through the step counting algorithm. The group returned to chalk and a blackboard to revamp our vision and finalize how we wanted to structure our website. After trying out different ideas, we landed on a finalized website and successfully executed our vision together.

Throughout the implementation of the project, all three members worked together on brainstorming and executing the vision. Once the brainstorming was completed, Ryan and Matt specialized on programming and debugging the website while Isaiah focused on the writing and reasonings behind each segment of our website. We used discord to communicate in-the-moment bugs and website designs. Although there were a lot of back and forth discussions, the team collectively helped execute the vision altogether. The collective discussions we had was the driving force behind our successful progress. We hope you have enjoyed interacting with the website as much as we have enjoyed working on it.