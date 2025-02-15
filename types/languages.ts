import { DeveloperRole } from "./auth.types";

export interface ProgrammingLanguage {
  id: string;
  name: string;
  iconPath?: string;
  suggestedFor: DeveloperRole[];
}

export const PROGRAMMING_LANGUAGES: ProgrammingLanguage[] = [
  {
    id: "typescript",
    name: "TypeScript",
    suggestedFor: [
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Developer",
    ],
    iconPath: "/languages/ts.svg",
  },
  {
    id: "javascript",
    name: "JavaScript",
    suggestedFor: [
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Developer",
    ],
    iconPath: "/languages/js.svg",
  },
  {
    id: "python",
    name: "Python",
    suggestedFor: [
      "Backend Developer",
      "Data Scientist",
      "Full Stack Developer",
    ],
    iconPath: "/languages/python.svg",
  },
  {
    id: "java",
    name: "Java",
    suggestedFor: [
      "Backend Developer",
      "Mobile Developer",
      "Full Stack Developer",
    ],
    iconPath: "/languages/java.svg",
  },
  {
    id: "swift",
    name: "Swift",
    suggestedFor: ["Mobile Developer"],
    iconPath: "/languages/swift.svg",
  },
  {
    id: "kotlin",
    name: "Kotlin",
    suggestedFor: ["Mobile Developer", "Backend Developer"],
    iconPath: "/languages/kotlin.svg",
  },
  {
    id: "rust",
    name: "Rust",
    suggestedFor: ["Backend Developer", "DevOps Engineer"],
    iconPath: "/languages/rust.svg",
  },
  {
    id: "go",
    name: "Go",
    suggestedFor: ["Backend Developer", "DevOps Engineer"],
    iconPath: "/languages/go.svg",
  },
  {
    id: "ruby",
    name: "Ruby",
    suggestedFor: ["Backend Developer", "Full Stack Developer"],
    iconPath: "/languages/ruby.svg",
  },
  {
    id: "php",
    name: "PHP",
    suggestedFor: ["Backend Developer", "Full Stack Developer"],
    iconPath: "/languages/php.svg",
  },
  {
    id: "webassembly",
    name: "WebAssembly",
    suggestedFor: ["Backend Developer", "Full Stack Developer"],
    iconPath: "/languages/wa.svg",
  },
  {
    id: "csharp",
    name: "C#",
    suggestedFor: [
      "Backend Developer",
      "Full Stack Developer",
      "Mobile Developer",
    ],
    iconPath: "/languages/csharp.svg",
  },
  {
    id: "cpp",
    name: "C++",
    suggestedFor: ["Backend Developer", "Game Developer", "Systems Engineer"],
    iconPath: "/languages/c++.svg",
  },
  {
    id: "c",
    name: "C",
    suggestedFor: ["Systems Engineer", "Embedded Developer"],
    iconPath: "/languages/c.png",
  },
  {
    id: "scala",
    name: "Scala",
    suggestedFor: ["Backend Developer", "Data Engineer"],
    iconPath: "/languages/scala.svg",
  },
  {
    id: "dart",
    name: "Dart",
    suggestedFor: ["Mobile Developer", "Frontend Developer"],
    iconPath: "/languages/dart.svg",
  },
  {
    id: "elixir",
    name: "Elixir",
    suggestedFor: ["Backend Developer"],
    iconPath: "/languages/elixir.svg",
  },
];
