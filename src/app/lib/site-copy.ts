import type { Locale } from "./portfolio-content";

export interface SiteCopy {
  navigation: {
    about: string;
    projects: string;
    skills: string;
    blog: string;
    feedback: string;
    contact: string;
    home: string;
    admin: string;
  };
  pages: {
    projectsEyebrow: string;
    skillsEyebrow: string;
    blogEyebrow: string;
    recommendationsEyebrow: string;
  };
  common: {
    all: string;
    featured: string;
    previous: string;
    next: string;
    page: string;
    of: string;
    demo: string;
    repo: string;
    home: string;
  };
  projects: {
    viewCaseStudy: string;
    viewFullDetails: string;
    notFoundEyebrow: string;
    notFoundTitle: string;
    backToProjects: string;
    problem: string;
    solution: string;
    fullNotes: string;
    outcomes: string;
    year: string;
    client: string;
    role: string;
    duration: string;
    techStack: string;
    impact: string;
    links: string;
    liveDemo: string;
    repository: string;
    noMatch: string;
    notSpecified: string;
    confidential: string;
  };
  skills: {
    searchPlaceholder: string;
    noMatch: string;
    liveCloud: string;
    moreInCategory: (count: number) => string;
    countLabel: (count: number) => string;
  };
  blog: {
    readArticle: string;
    readFullArticle: string;
    notFoundEyebrow: string;
    notFoundTitle: string;
    backToBlog: string;
    by: string;
    topics: string;
    keyTakeaways: string;
    readExternalSource: string;
    noMatch: string;
  };
  recommendations: {
    emptyState: string;
    unavailable: string;
    selectedFile: string;
  };
}

const siteCopy: Record<Locale, SiteCopy> = {
  en: {
    navigation: {
      about: "About",
      projects: "Projects",
      skills: "Skills",
      blog: "Blog",
      feedback: "Feedback",
      contact: "Contact",
      home: "Home",
      admin: "Admin",
    },
    pages: {
      projectsEyebrow: "Case Studies",
      skillsEyebrow: "Capabilities",
      blogEyebrow: "Writing",
      recommendationsEyebrow: "Social Proof",
    },
    common: {
      all: "All",
      featured: "Featured",
      previous: "Previous",
      next: "Next",
      page: "Page",
      of: "of",
      demo: "Demo",
      repo: "Repo",
      home: "Home",
    },
    projects: {
      viewCaseStudy: "View case study",
      viewFullDetails: "View full details",
      notFoundEyebrow: "Project Not Found",
      notFoundTitle: "That case study could not be found.",
      backToProjects: "Back to projects",
      problem: "Problem",
      solution: "Solution",
      fullNotes: "Full Project Notes",
      outcomes: "Outcomes",
      year: "Year",
      client: "Client",
      role: "Role",
      duration: "Duration",
      techStack: "Tech Stack",
      impact: "Impact",
      links: "Links",
      liveDemo: "Live demo",
      repository: "Repository",
      noMatch: "No projects match this filter yet.",
      notSpecified: "Not specified",
      confidential: "Confidential",
    },
    skills: {
      searchPlaceholder: "Search skills or categories",
      noMatch: "No skills matched your search.",
      liveCloud: "Live cloud",
      moreInCategory: (count) => `+${count} more in this category`,
      countLabel: (count) => `${count} skills`,
    },
    blog: {
      readArticle: "Read article",
      readFullArticle: "Read full article",
      notFoundEyebrow: "Article Not Found",
      notFoundTitle: "That article could not be found.",
      backToBlog: "Back to blog",
      by: "By",
      topics: "Topics",
      keyTakeaways: "Key Takeaways",
      readExternalSource: "Read external source",
      noMatch: "No articles match this filter yet.",
    },
    recommendations: {
      emptyState: "Approved recommendations will show up here once they are reviewed.",
      unavailable:
        "Recommendation submissions will appear here once MongoDB and storage are configured.",
      selectedFile: "Selected file",
    },
  },
  fr: {
    navigation: {
      about: "A propos",
      projects: "Projets",
      skills: "Competences",
      blog: "Blog",
      feedback: "Avis",
      contact: "Contact",
      home: "Accueil",
      admin: "Admin",
    },
    pages: {
      projectsEyebrow: "Etudes de cas",
      skillsEyebrow: "Competences",
      blogEyebrow: "Articles",
      recommendationsEyebrow: "Temoignages",
    },
    common: {
      all: "Tout",
      featured: "A la une",
      previous: "Precedent",
      next: "Suivant",
      page: "Page",
      of: "sur",
      demo: "Demo",
      repo: "Depot",
      home: "Accueil",
    },
    projects: {
      viewCaseStudy: "Voir l'etude de cas",
      viewFullDetails: "Voir tous les details",
      notFoundEyebrow: "Projet introuvable",
      notFoundTitle: "Cette etude de cas est introuvable.",
      backToProjects: "Retour aux projets",
      problem: "Probleme",
      solution: "Solution",
      fullNotes: "Notes completes du projet",
      outcomes: "Resultats",
      year: "Annee",
      client: "Client",
      role: "Role",
      duration: "Duree",
      techStack: "Stack technique",
      impact: "Impact",
      links: "Liens",
      liveDemo: "Demo en ligne",
      repository: "Depot",
      noMatch: "Aucun projet ne correspond encore a ce filtre.",
      notSpecified: "Non precise",
      confidential: "Confidentiel",
    },
    skills: {
      searchPlaceholder: "Rechercher une competence ou une categorie",
      noMatch: "Aucune competence ne correspond a votre recherche.",
      liveCloud: "Nuage en direct",
      moreInCategory: (count) => `+${count} de plus dans cette categorie`,
      countLabel: (count) => `${count} competences`,
    },
    blog: {
      readArticle: "Lire l'article",
      readFullArticle: "Lire l'article complet",
      notFoundEyebrow: "Article introuvable",
      notFoundTitle: "Cet article est introuvable.",
      backToBlog: "Retour au blog",
      by: "Par",
      topics: "Sujets",
      keyTakeaways: "Points cles",
      readExternalSource: "Lire la source externe",
      noMatch: "Aucun article ne correspond encore a ce filtre.",
    },
    recommendations: {
      emptyState:
        "Les recommandations approuvees apparaitront ici apres validation.",
      unavailable:
        "Le formulaire d'avis apparaitra ici une fois MongoDB et le stockage configures.",
      selectedFile: "Fichier selectionne",
    },
  },
};

export function getSiteCopy(locale: Locale) {
  return siteCopy[locale];
}
