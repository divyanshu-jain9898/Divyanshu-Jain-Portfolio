/* Showcase content. Edit text here; the layout lives in index.html. */
window.SHOWCASE = {
  /* How long each chapter stays on screen in auto-play (ms). */
  autoplay: {
    intro: 8000, about: 10000, skills: 10000, experience: 10000, ai: 17000, mobile: 11000, web3d: 11000,
    conversion: 12000, tools: 13000, data: 10000, symbols: 11000, theater: 11000, beyond: 10000, motion: 13000, iot: 10000, contact: 12000,
  },

  /* Small labels shown in the chapter menu. */
  chapterTags: {
    intro: "Profile", about: "Profile", skills: "Profile", experience: "Profile",
    ai: "SP3D", mobile: "SP3D", web3d: "SP3D", conversion: "SP3D", tools: "SP3D", data: "SP3D", symbols: "SP3D", theater: "Demos",
    beyond: "Beyond SP3D", motion: "Beyond SP3D", iot: "Beyond SP3D", contact: "Contact",
  },

  skills: [
    {
      id: "s3d", label: "Smart 3D", sub: "Admin & customization", x: 50, y: 5,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z"/><path d="m3 7 9 5 9-5M12 12v10"/></svg>',
      title: "Intergraph Smart 3D (SP3D / S3D)",
      intro: "Project setup to deliverables — the reference data, rules and admin work that keep a Smart 3D project consistent.",
      items: [
        { name: "Catalog & specifications", desc: "Bulkload sheets, custom business rules, spec libraries and code lists." },
        { name: "Smart symbols", desc: "Valves, flanges, equipment, instruments, stairs and ladders." },
        { name: "Hangers & supports", desc: "8-type support library, sloped lines and steel, editable properties." },
        { name: "Drawings & reports", desc: "Isometrics, GADs, MTOs, view styles, graphic and label rules." },
        { name: "Administration", desc: "Permission groups, naming rules, piping callouts, IFC, model ↔ catalog sync." },
        { name: "Custom commands", desc: "C# / VB.NET commands on the Smart 3D object model." },
      ],
    },
    {
      id: "dev", label: "Development", sub: "Languages & platforms", x: 93, y: 36,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m8 9-4 3 4 3M16 9l4 3-4 3M13.5 5l-3 14"/></svg>',
      title: "Software development",
      intro: "Desktop tools engineers actually use — with review steps, logs and read-back checks built in.",
      items: [
        { name: "C# / .NET", desc: "Smart 3D add-ins, custom commands, desktop tools, packaging and deployment." },
        { name: "VB.NET · C · C++", desc: "Legacy Smart 3D automation and systems-level work." },
        { name: "Python", desc: "AI / ML pipelines, OCR, PDF parsing, Excel and report automation." },
        { name: "SQL", desc: "Oracle and SQL Server — catalog and model database queries." },
        { name: "JavaScript · Three.js", desc: "Browser 3D viewers, simulations and this showcase." },
        { name: "Android", desc: "Mobile client that drives Smart 3D through the assistant." },
      ],
    },
    {
      id: "apis", label: "CAD APIs", sub: "Conversion & integration", x: 78, y: 88,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h12l-3-3M20 17H8l3 3"/></svg>',
      title: "CAD APIs & model conversion",
      intro: "Moving engineering data between platforms without re-modeling it by hand.",
      items: [
        { name: "Smart 3D API & Symbol API", desc: "Object model, symbols, custom aspects, auto-modeling engines." },
        { name: "Revit C# API · Dynamo", desc: "Structural and architectural extraction; Revit automation." },
        { name: "AutoCAD Plant 3D .NET API", desc: "Piping and equipment extraction for SP3D auto-modeling." },
        { name: "Navisworks API", desc: "Model properties and geometry extraction." },
        { name: "Conversion pipelines", desc: "Revit, Plant 3D, E3D and P&ID → SP3D; SP3D → Web3D." },
        { name: "SmartSketch drawings", desc: "Drawing-editor automation for Smart 3D drawings." },
      ],
    },
    {
      id: "ai", label: "AI & data", sub: "LLMs, MCP, vision", x: 20, y: 88,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><rect x="7" y="7" width="10" height="10" rx="2"/><path d="M10 10h4v4h-4z"/></svg>',
      title: "AI for engineering",
      intro: "Practical AI wired into engineering software — grounded in the model, reviewed before it writes.",
      items: [
        { name: "Model Context Protocol", desc: "Smart 3D operations exposed as discoverable MCP tools." },
        { name: "LLMs & RAG", desc: "Assistants grounded in project knowledge; local LLM deployment." },
        { name: "Computer vision & OCR", desc: "OpenCV + OCR on P&ID PDFs: symbols, line numbers, tags." },
        { name: "Auto-modeling", desc: "Extracted data turned into placed Smart 3D objects mapped to specs." },
        { name: "Batch ETL", desc: "Extraction → transformation → mapping layers between platforms." },
        { name: "Voice & hologram UI", desc: "Voice-commanded avatar and 3D model explorer." },
      ],
    },
    {
      id: "domain", label: "Domain", sub: "EPC & plant design", x: 7, y: 36,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18M5 21V10l5-3v14M10 21V5l9 4v12M14 13h2M14 17h2"/></svg>',
      title: "Plant-design domain",
      intro: "I speak the language of the engineers I build for.",
      items: [
        { name: "Disciplines", desc: "Piping, equipment, structural, civil, instrumentation, hangers & supports." },
        { name: "Deliverables", desc: "P&IDs, isometrics, GADs, MTOs, IFC and support drawing packages." },
        { name: "EPC delivery", desc: "Client standards and specs on Saudi Aramco and Venture Global projects." },
        { name: "Platforms", desc: "SmartPlant 3D, SmartSketch, Hexagon PPM suite, Navisworks, Revit, AutoCAD." },
      ],
    },
  ],

  /* Chapter 08 — conversion */
  conv: {
    plant3d: {
      source: "Plant 3D",
      shape: "plant",
      before: "media/conv/plant3d-before.webp",
      after: "media/conv/plant3d-after.webp",
      beforeAlt: "AutoCAD Plant 3D model with tanks, vessels and piping",
      afterAlt: "The same plant converted into Smart 3D",
      summary: "An extraction pipeline on the AutoCAD Plant 3D .NET API captures piping and equipment. Smart 3D custom commands place pipes, fittings and equipment with the correct properties and connectivity — reviewed in a conversion grid first.",
      features: [
        "Pipes, fittings and equipment with properties and connections",
        "Review grid with spec mapping before anything is created",
        "Equipment and nozzles placed in position",
        "Runs from the SP3D AI Assistant",
      ],
      stack: ["Plant 3D .NET API", "Smart 3D API", "C# / .NET"],
      video: "plant3d-to-sp3d", dur: "1:23",
    },
    revit: {
      source: "Revit",
      shape: "building",
      before: "media/conv/revit-before.webp",
      after: "media/conv/revit-after.webp",
      beforeAlt: "Revit model of a multi-storey building",
      afterAlt: "The same building rebuilt as Smart 3D objects",
      summary: "A Revit C# API and Dynamo extractor captures the structural and architectural model. C# custom commands then place every member in Smart 3D with the right orientation, size and attributes — no re-modeling from scratch.",
      features: [
        "Columns, beams, braces, curved steel, slabs, walls, openings, footings and grids",
        "Stairs and ladders included",
        "Mapping layer between Revit families and Smart 3D catalog parts",
        "Runs from the SP3D AI Assistant",
      ],
      stack: ["Revit C# API", "Dynamo", "Smart 3D API", "C# / .NET"],
      video: "revit-to-sp3d", dur: "0:46",
    },
  },

  /* Chapter 09 — admin & modeling tools */
  tools: [
    {
      id: "workspace", mono: "WS", title: "SP3D Tools workspace", tag: "One desktop shell",
      tagline: "One workspace that hosts every manager, the AI assistant and the utilities — each module keeps its own connection to the plant, catalog and schema.",
      features: ["NameRule, Property, CodeList, Catalog and Report managers", "AI assistant, Bulkload Extractor, Property Updater and more", "Shared plant, catalog, schema and SharedContent connection", "Windows authentication — no stored passwords"],
      stack: ["C# / .NET", "Desktop UI", "Smart 3D SDK"],
      shots: [{ src: "media/shots/tools-overview.webp", cap: "SP3D Tools — one workspace for every module" }],
    },
    {
      id: "namerule", mono: "NR", title: "NameRule Manager", tag: "Rules without code",
      tagline: "Design naming rules visually, then generate, compile and deploy them to Smart 3D. Smart equipment alone exposes 133 schema properties in the browser.",
      features: ["Schema property browser, hidden and related properties", "Ordered conditional branches with All / Any logic", "Generates the C# project, DLL and BulkLoad sheets", "Native BulkLoad deployment with verification"],
      stack: ["C# / .NET", "Smart 3D SDK", "BulkLoad", "Code generation"],
      video: "namerule-manager", dur: "4:14",
      shots: [
        { src: "media/shots/namerule-designer.webp", cap: "Rule designer — patterns from schema properties" },
        { src: "media/shots/namerule-conditions.webp", cap: "Ordered conditional branches" },
        { src: "media/shots/namerule-variants.webp", cap: "Per-object-type pattern variants" },
      ],
    },
    {
      id: "property", mono: "PM", title: "Property Manager", tag: "Definitions & values",
      tagline: "Create custom attributes and edit object values across the model, with a before/after review on every change.",
      features: ["Values from each object's real SDK interfaces", "Append or AMD with typed values and codelists", "Preflight checks before applying to all objects", "Definitions packaged as native BulkLoad"],
      stack: ["C# / .NET", "Smart 3D SDK", "BulkLoad"],
      shots: [
        { src: "media/shots/property-values.webp", cap: "Object values, queued as typed changes" },
        { src: "media/shots/property-definitions.webp", cap: "Custom attribute definitions" },
        { src: "media/shots/property-review.webp", cap: "Before / after review" },
      ],
    },
    {
      id: "approval", mono: "PA", title: "Pipeline Approval", tag: "Bulk status",
      tagline: "Set approval status or permission group on many pipelines at once — cascaded to everything inside them, in Smart 3D's own order.",
      features: ["Working / In Review / Reject / Approve in one click", "Cascades to runs, parts, welds, bolt sets and gaskets", "Excel lists of OIDs or names; saved filters", "Batch commits with safe cancel"],
      stack: ["C# / .NET", "Smart 3D SDK", "SQL"],
      shots: [{ src: "media/shots/pipeline-approval.webp", cap: "Pipeline Approval — bulk status and permission groups" }],
    },
    {
      id: "report", mono: "RM", title: "Report Manager", tag: "Native reports",
      tagline: "Design calculated reports and MTO summaries, then build and deploy native Smart 3D report templates with read-back verification.",
      features: ["Calculated columns with a safe formula parser", "Grouped MTO summaries and validation reports", "Preview, then full Excel export", "Builds native templates and deploys to the catalog"],
      stack: ["C# / .NET", "SQL", "Smart 3D Reports"],
      shots: [{ src: "media/illus/report-manager.svg", cap: "Report Manager — from schema properties to native report templates" }],
    },
  ],

  /* Chapter 10 — bulkload & catalog data */
  data: [
    {
      id: "extractor", title: "Bulkload Extractor", tag: "Saved filter → sheets",
      tagline: "Every Bulkload sheet needed to recreate the objects of a saved filter — read live from the databases.",
      shots: [
        { src: "media/shots/bulkload-preview.webp", cap: "Bulkload Extractor — grouped objects, occurrences and worksheets in load order" },
        { src: "media/shots/bulkload-extractor.webp", cap: "Extraction run with read-back verification" },
      ],
    },
    {
      id: "catalog", title: "Catalog Manager", tag: "Forms, not sheets",
      tagline: "Create and maintain catalog parts and specifications through guided forms instead of Bulkload sheets.",
      shots: [
        { src: "media/shots/catalog-spec.webp", cap: "Create a specification from an existing one" },
        { src: "media/shots/catalog-pipe-size.webp", cap: "One-form pipe size: stock, dimensions and spec entries" },
        { src: "media/shots/catalog-form.webp", cap: "Guided part forms — only changed values are sent" },
      ],
    },
    {
      id: "codelist", title: "CodeList Manager", tag: "Deploy & verify",
      tagline: "Prepare, deploy and verify CodeList changes with native Bulkload export and safety locks.",
      shots: [
        { src: "media/shots/codelist-library.webp", cap: "Searchable CodeList library" },
        { src: "media/shots/codelist-review.webp", cap: "Review & build with catalog fingerprint checks" },
      ],
    },
    {
      id: "updater", title: "Property Updater", tag: "Excel → model",
      tagline: "Update editable properties on thousands of objects from Excel — typed, validated and logged row by row.",
      shots: [{ src: "media/shots/property-updater.webp", cap: "Property Updater — map once, validate, update in batches" }],
    },
  ],

  /* Chapter 11 — support library board (tile artwork in 272 x 240 tile units) */
  supports: [
    { name: "Goal post · braced", note: "Two posts and a beam with knee braces — for wide pipe racks.",
      art: '<path class="st" d="M70 200V80M202 200V80M60 80h152"/><path class="br" d="M70 150l40-70M202 150l-40-70"/><circle class="pp" cx="136" cy="62" r="16"/>' },
    { name: "Goal post", note: "Two posts and a beam; height and span editable from the model.",
      art: '<path class="st" d="M70 200V80M202 200V80M60 80h152"/><circle class="pp" cx="136" cy="62" r="16"/>' },
    { name: "Cantilever · braced", note: "Single post with an arm and a diagonal brace.",
      art: '<path class="st" d="M70 200V60M70 90h130"/><path class="br" d="M70 160l80-70"/><circle class="pp" cx="176" cy="72" r="16"/>' },
    { name: "Cantilever", note: "Single post with an arm; offset editable from the model.",
      art: '<path class="st" d="M70 200V60M70 90h130"/><circle class="pp" cx="176" cy="72" r="16"/>' },
    { name: "Shoe", note: "Pipe shoe on a base plate — sloped lines supported.",
      art: '<rect class="bs" x="40" y="168" width="192" height="12"/><path class="sh" d="M96 168V120h80v48"/><rect class="pl" x="76" y="112" width="120" height="10"/><circle class="pp" cx="136" cy="86" r="26"/>' },
    { name: "Axial stop", note: "Restrains axial movement with stops on the pipe.",
      art: '<rect class="bs" x="40" y="168" width="192" height="12"/><rect class="pp" x="36" y="74" width="200" height="26" rx="13"/><path class="og" d="M100 168v-56M172 168v-56"/>' },
    { name: "Guide", note: "Lets the pipe slide while guiding it laterally.",
      art: '<rect class="bs" x="40" y="168" width="192" height="12"/><circle class="pp" cx="136" cy="110" r="30"/><path class="st" d="M92 168V84M180 168V84"/>' },
    { name: "Hold-down", note: "U-bolt hold-down onto steel, including sloped steel.",
      art: '<rect class="bs" x="40" y="168" width="192" height="12"/><circle class="pp" cx="136" cy="122" r="28"/><path class="ub" d="M96 168v-46a40 40 0 0 1 80 0v46"/>' },
  ],

  /* Lightbox galleries opened from chapter 11 */
  galleries: {
    routecraft: {
      title: "RouteCraft 3D",
      items: [{ src: "media/illus/routecraft.svg", cap: "RouteCraft 3D — pipe routing inside a running Smart 3D session: automatic elbows and fittings, vents, drains and supports, with a step history and undo." }],
    },
    pid: {
      title: "P&ID → SP3D",
      items: [{ src: "media/shots/pid-assistant.webp", cap: "P&ID → SP3D — computer vision reads P&ID PDFs; traces, components and connections are reviewed, then auto-modeled in Smart 3D." }],
    },
  },

  /* Chapter 12 — demo theater, in showcase order */
  videos: [
    {
      id: "sp3d-ai-assistant", title: "SP3D AI Assistant", kicker: "AI · MCP", dur: "3:40",
      poster: "media/posters/sp3d-ai-assistant.webp", preview: "media/video/previews/sp3d-ai-assistant.mp4", src: "media/video/sp3d-ai-assistant.mp4",
      desc: "Chat with a live Smart 3D model: query, select, route pipe and place valves — every edit reviewed on an approval card before commit.",
    },
    {
      id: "sp3d-ai-mobile", title: "SP3D AI Assistant · Android", kicker: "AI · Mobile", dur: "0:38", portrait: true,
      poster: "media/posters/sp3d-ai-mobile.webp", preview: "media/video/previews/sp3d-ai-mobile.mp4", src: "media/video/sp3d-ai-mobile.mp4",
      desc: "Drive Smart 3D from a phone — here running the saved action that synchronizes the model with the catalog.",
    },
    {
      id: "web3d", title: "SP3D → Web3D viewer", kicker: "Web 3D · live demo", dur: "Live", live: true,
      poster: "media/shots/web3d-operation.webp",
      desc: "Not a video — a real exported plant. Open it, orbit it and click any object for its properties.",
    },
    {
      id: "plant3d-to-sp3d", title: "Plant 3D → SP3D", kicker: "Conversion", dur: "1:23",
      poster: "media/posters/plant3d-to-sp3d.webp", preview: "media/video/previews/plant3d-to-sp3d.mp4", src: "media/video/plant3d-to-sp3d.mp4",
      desc: "Pipes, fittings and equipment pulled from AutoCAD Plant 3D and rebuilt in Smart 3D with properties and connections.",
    },
    {
      id: "revit-to-sp3d", title: "Revit → SP3D", kicker: "Conversion", dur: "0:46",
      poster: "media/posters/revit-to-sp3d.webp", preview: "media/video/previews/revit-to-sp3d.mp4", src: "media/video/revit-to-sp3d.mp4",
      desc: "Structural and architectural Revit data extracted and auto-modeled in Smart 3D, run from the SP3D AI Assistant.",
    },
    {
      id: "namerule-manager", title: "NameRule Manager", kicker: "Admin automation", dur: "4:14",
      poster: "media/posters/namerule-manager.webp", preview: "media/video/previews/namerule-manager.mp4", src: "media/video/namerule-manager.mp4",
      desc: "Design a naming rule visually, then generate, compile and deploy it to Smart 3D — no hand-written code.",
    },
    {
      id: "hologram-assistant", title: "3D Model Hologram AI Assistant", kicker: "AR · Hologram", dur: "3:47", portrait: true,
      poster: "media/posters/hologram-assistant.webp", preview: "media/video/previews/hologram-assistant.mp4", src: "media/video/hologram-assistant.mp4",
      desc: "A hand-built hologram display with a voice-commanded AI avatar and a 3D model explorer.",
    },
    {
      id: "skeleton-motion", title: "Automatic Movement by Skeleton", kicker: "Motion tracking", dur: "0:15", portrait: true, muted: true,
      poster: "media/posters/skeleton-motion.webp", preview: "media/video/previews/skeleton-motion.mp4", src: "media/video/skeleton-motion.mp4",
      desc: "A Unity skeleton that copies the user's body movement in real time — Python body tracking streamed to a C# character.",
    },
    {
      id: "avatar-assistant", title: "My Own Avatar Personal Assistant", kicker: "AI avatar", dur: "1:58", portrait: true, muted: true,
      poster: "media/posters/avatar-assistant.webp", preview: "media/video/previews/avatar-assistant.mp4", src: "media/video/avatar-assistant.mp4",
      desc: "A personal-assistant avatar built in Unity with Inworld — it holds a live conversation and answers questions about my skills and projects.",
    },
    {
      id: "body-motion-game", title: "Play a Game with Body Movement", kicker: "Computer vision", dur: "0:24", portrait: true, muted: true,
      poster: "media/posters/body-motion-game.webp", preview: "media/video/previews/body-motion-game.mp4", src: "media/video/body-motion-game.mp4",
      desc: "Subway Surfers played with the body: lean left or right to change lanes, sit to slide and jump to jump.",
    },
  ],

  /* Chapter 07 — simulations & renders filmstrip */
  sims: [
    { label: "Plant operation", src: "media/shots/web3d-operation.webp", thumb: "media/thumbs/web3d-operation.webp" },
    { label: "Fire radiation", src: "media/shots/web3d-fire.webp", thumb: "media/thumbs/web3d-fire.webp" },
    { label: "Jet fire", src: "media/shots/web3d-jet-fire.webp", thumb: "media/thumbs/web3d-jet-fire.webp" },
    { label: "Gas dispersion", src: "media/shots/web3d-gas.webp", thumb: "media/thumbs/web3d-gas.webp" },
    { label: "Crane lift", src: "media/shots/web3d-lift.webp", thumb: "media/thumbs/web3d-lift.webp" },
    { label: "4D sequence", src: "media/shots/web3d-4d.webp", thumb: "media/thumbs/web3d-4d.webp" },
    { label: "AI in the viewer", src: "media/shots/web3d-ai-assistant.webp", thumb: "media/thumbs/web3d-ai-assistant.webp" },
    { label: "Operation close-up", src: "media/shots/web3d-operation-closeup.webp", thumb: "media/thumbs/web3d-operation-closeup.webp" },
    { label: "AI render · golden hour", src: "media/shots/web3d-render-golden.webp", thumb: "media/thumbs/web3d-render-golden.webp" },
    { label: "AI render · day", src: "media/shots/web3d-render-day.webp", thumb: "media/thumbs/web3d-render-day.webp" },
    { label: "Secure sharing", src: "media/shots/web3d-share.webp", thumb: "media/thumbs/web3d-share.webp" },
  ],

  /* Chapter 13 — beyond SP3D */
  beyond: [
    { title: "Revit AI Assistant", cat: "AI · LLM", text: "AI help for Revit model queries and design workflows.", icon: "M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3ZM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" },
    { title: "PDF → CAD conversion", cat: "Computer vision", text: "Turns PDF drawings into editable CAD files.", icon: "M12 3 3 8l9 5 9-5-9-5ZM3 13l9 5 9-5M3 17.5l9 5 9-5" },
    { title: "Multilingual PDF → English", cat: "AI · LLM", text: "Translates drawing and document PDFs into English.", icon: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" },
    { title: "CAD Spell Checker", cat: "Desktop", text: "Finds spelling errors in drawing text and annotations.", icon: "M4 6h10M4 11h7M4 16h5M13 15l3 3 5-6" },
    { title: "Revit Sheet → CAD", cat: "Desktop", text: "Converts Revit sheets into CAD drawing deliverables.", icon: "M5 3h10l4 4v14H5V3ZM15 3v4h4M8 12h8M8 16h5" },
    { title: "LLM deployment", cat: "AI infrastructure", text: "Large language models deployed behind internal AI apps.", icon: "M4 5h16v5H4zM4 14h16v5H4zM7.5 7.5h.01M7.5 16.5h.01" },
    { title: "P&ID → MTO automation", cat: "Computer vision", text: "OpenCV + OCR read P&IDs and produce material take-offs.", icon: "M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16" },
    { title: "LLM chatbot", cat: "Python · AI", text: "Conversational assistant built with Python and an LLM.", icon: "M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12ZM8.5 12h.01M12 12h.01M15.5 12h.01" },
  ],

  /* Chapter 14 — motion tracking, avatars & games (videos are muted) */
  motion: [
    {
      video: "skeleton-motion", title: "Automatic Movement by Skeleton", cat: "Motion tracking",
      text: "The skeleton moves exactly as the user moves — the kind of real-time motion capture widely used to build virtual games.",
      tech: ["Python", "C#", "Unity"],
    },
    {
      video: "avatar-assistant", title: "My Own Avatar Personal Assistant", cat: "AI avatar",
      text: "A 3D avatar assistant in Unity that chats in real time and answers questions about my skills and projects.",
      tech: ["Unity", "Inworld assets"],
    },
    {
      video: "body-motion-game", title: "Play a Game with Body Movement", cat: "Computer vision",
      text: "Play Subway Surfers with your body — move left or right to change lanes, sit to slide and jump to jump.",
      tech: ["OpenCV", "MediaPipe", "PyAutoGUI", "Python"],
    },
  ],

  /* Chapter 15 — IoT & robotics */
  iot: [
    {
      title: "Voice-Controlled Robotic Mask", cat: "IoT · Machine learning",
      text: "A wearable robotic mask built around a Raspberry Pi: a machine-learning speech model recognizes voice commands and drives the mask's moving parts and LED eyes.",
      stack: ["Raspberry Pi", "Machine learning", "Voice control", "Embedded electronics"],
      poster: "media/iot/mask-poster.webp",
      gallery: [
        { src: "media/iot/mask-poster.webp", cap: "Voice-Controlled Robotic Mask" },
        { src: "media/iot/mask-1.webp", cap: "LED-lit mask with its control code running behind it" },
        { src: "media/iot/mask-0.webp", cap: "Front view — moving plates and LED lighting" },
        { src: "media/iot/mask-2.webp", cap: "Side view with the lighting on" },
        { src: "media/iot/mask-3.webp", cap: "Profile of the hand-built shell" },
      ],
    },
    {
      title: "Robotic Car", cat: "IoT · Robotics",
      text: "An Arduino-driven robotic car: the control logic drives DC motors through a motor-driver board, with add-on modules wired and tested on a breadboard.",
      stack: ["Arduino", "C / C++", "Motor driver", "Add-on modules"],
      poster: "media/iot/car-poster.webp",
      gallery: [
        { src: "media/iot/car-poster.webp", cap: "Robotic Car" },
        { src: "media/iot/car-1.webp", cap: "Chassis, motors, wheels and wiring" },
        { src: "media/iot/car-0.webp", cap: "Development bench — breadboard, Arduino and laptop" },
        { src: "media/iot/car-2.webp", cap: "Close-up of the drive wheels and wiring" },
      ],
    },
  ],
};
