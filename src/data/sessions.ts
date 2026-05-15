export interface MindNode {
  id: string;
  label: string;
  x: number;
  y: number;
  parent?: string;
}

export interface Session {
  id: string;
  title: string;
  createdAt: string;
  duration: string;
  transcript: string;
  nodes: MindNode[];
}

export const sampleSessions: Session[] = [
  {
    id: "s1",
    title: "Podcast launch strategy",
    createdAt: "2 hours ago",
    duration: "3:42",
    transcript:
      "I want to start a podcast about the future of work and AI tools for creators. It should help solopreneurs grow, stay productive, and build an audience. The first season should cover monetization, storytelling, and consistency.",
    nodes: [
      { id: "root", label: "Podcast Idea", x: 50, y: 50 },
      { id: "n1", label: "Audience", x: 18, y: 22, parent: "root" },
      { id: "n2", label: "Monetization", x: 82, y: 22, parent: "root" },
      { id: "n3", label: "Marketing", x: 18, y: 78, parent: "root" },
      { id: "n4", label: "Script Topics", x: 82, y: 78, parent: "root" },
      { id: "n5", label: "Solopreneurs", x: 6, y: 8, parent: "n1" },
      { id: "n6", label: "Sponsorships", x: 94, y: 8, parent: "n2" },
      { id: "n7", label: "Newsletter", x: 6, y: 92, parent: "n3" },
      { id: "n8", label: "Hook ideas", x: 94, y: 92, parent: "n4" },
    ],
  },
  {
    id: "s2",
    title: "Product roadmap Q3",
    createdAt: "Yesterday",
    duration: "5:11",
    transcript:
      "Our Q3 roadmap should focus on collaboration features, performance improvements, and a new pricing tier for teams.",
    nodes: [
      { id: "root", label: "Q3 Roadmap", x: 50, y: 50 },
      { id: "n1", label: "Collaboration", x: 20, y: 25, parent: "root" },
      { id: "n2", label: "Performance", x: 80, y: 25, parent: "root" },
      { id: "n3", label: "Pricing", x: 50, y: 85, parent: "root" },
    ],
  },
  {
    id: "s3",
    title: "Essay outline — creative AI",
    createdAt: "3 days ago",
    duration: "2:08",
    transcript:
      "Exploring how creative AI changes the writing process for novelists and journalists in the next decade.",
    nodes: [
      { id: "root", label: "Creative AI", x: 50, y: 50 },
      { id: "n1", label: "Novelists", x: 20, y: 30, parent: "root" },
      { id: "n2", label: "Journalists", x: 80, y: 30, parent: "root" },
      { id: "n3", label: "Ethics", x: 50, y: 85, parent: "root" },
    ],
  },
];
