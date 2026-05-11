window.SITE_CONTENT = window.SITE_CONTENT || {};

const featuredProjectPlaceholderImage =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100"><rect width="160" height="100" fill="%23e6d2bf"/></svg>';

window.SITE_CONTENT.projects = {
  publicationsHeading: "Selected publications",
  publications: [
    {
      html:
        'Harsh Kumar, Jasmine Chahal, <strong>Yinuo Zhao</strong>, Zeling Zhang, Annika Wei, Louis Tay, Ashton Anderson. When AI Gives Advice: Evaluating AI and Human Responses to Online Advice-Seeking for Well-Being. ACM Conference on Human Factors in Computing Systems (CHI 2025). <a class="projects-inline-link" href="https://arxiv.org/abs/2512.08937" target="_blank" rel="noreferrer">[arxiv]</a> <a class="projects-inline-link" href="https://dl.acm.org/doi/epdf/10.1145/3772318.3791233" target="_blank" rel="noreferrer">[ACM]</a>',
    },
  ],
  workingPapersHeading: "Working Paper",
  workingPapers: [
    {
      text:
        "High-Resolution Air Quality Mapping for Climate-Smart Public Health: Hourly PM₂.₅ Estimation in Madagascar. Harvard T.H. Chan School of Public Health, Madagascar Health and Environmental Research (MAHERY)",
    },
    {
      text:
        "Quantifying Wildfire Contributions to PM₂.₅ in Madagascar Using Nationwide 1 km Hourly Estimates. Harvard T.H. Chan School of Public Health, Madagascar Health and Environmental Research (MAHERY)",
    },
    {
      text:
        "Decoding associations between PM₂.₅ chemical composition and AOD spectral properties. University of Toronto, NASA Jet Propulsion Laboratory (JPL)",
    },
  ],
  otherProjectsHeading: "Long-term projects",
  otherProjects: [
    {
      text: "Personal Portfolio (this website!)",
      link: {
        href: "https://imyinuozhao.com/",
        label: "[link]",
      },
    },
    {
      text: "Beginner's Guide to Artificial Intelligence",
      link: {
        href: "https://github.com/inorrr/ai_beginner_guide",
        label: "[link]",
      },
    },
    {
      text: "Library of Useless but Beautiful Tools",
      link: {
        href: "https://github.com/inorrr/cool_projects",
        label: "[link]",
      },
    },
  ],
  featuredProjectsHeading: "Featured projects",
  featuredProjects: [
    {
      href: "https://github.com/inorrr/mirror_fit",
      imageSrc: "contents/resources/photos/mirrorfit.png",
      imageAlt: "Light orange placeholder preview for Project Zeta",
      title: "MirrorFit: A browser extension, your on-screen workout buddy",
      tags: "#ComputerVision #MediaPipe #WebDev #FitnessTech #OnDeviceAI #AmbientComputing #Canvas API #WebGL",
      status: "In development",
    },
    {
      href: "https://inorrr.github.io/climate_vulnerability/",
      imageSrc: "contents/resources/photos/climate_vulnerability.png",
      imageAlt: "Light orange placeholder preview for Project Alpha",
      title: "Climate Vulnerability and Social Justice in the Greater Boston Area",
      tags: "#GeoSpatial #DataVisualization #D3js #InteractiveVisualization #UrbanAnalytics #GIS",
    },
    {
      href: "https://github.com/inorrr/mutwo-activation-checkpointing",
      imageSrc: "contents/resources/photos/mutwo.png",
      imageAlt: "Minimal warm-toned illustration of GPU activation checkpointing and memory profiling",
      title: "PyTorch GPU Memory Profiler for Activation Checkpointing",
      tags: "#PyTorch #DeepLearningSystems #GPUComputing #ActivationCheckpointing #MachineLearningInfrastructure",
    },
    {
      href: "https://inorrr.github.io/ascii_live/",
      imageSrc: "contents/resources/photos/ascii.png",
      imageAlt: "Light orange placeholder preview for Project Gamma",
      title: "LiveGlyph: A browser-based webcam to ASCII generator",
      tags: "#ASCIIArt #WebcamArt #CanvasRendering #TypeScript #ReactJS #ViteJS #InteractiveArt #WebExperiment",
    },
    {
      href: "https://www.figma.com/deck/CuCl4fKrNeXmePgCaeNRzF/Tangible-Interfaces--Project-2?node-id=1-234&t=6Dqzb1sZ17x0rf9T-1",
      imageSrc: "contents/resources/photos/cuckoo.png",
      imageAlt: "Light orange placeholder preview for Project Beta",
      title: "Cuckoo Journal: A Tangible Interface for Memory and Reflection",
      tags: "#MIT #MediaLab #HumanComputerInteraction #TangibleInterface #TeleAbsence #CreativeTechnology",
    },
    {
      href: "https://inorrr.github.io/glassbox-translate/",
      imageSrc: "contents/resources/photos/translation.png",
      imageAlt: "Light orange placeholder preview for Project Delta",
      title: "Glassbox Translate: Visualizing Grammar-Driven Translation",
      tags: "#NaturalLanguageProcessing #ComputationalLinguistics #MachineTranslation #FastAPI #SoftwareEngineering",
    },
  ],
};
