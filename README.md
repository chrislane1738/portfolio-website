# Portfolio Website

A modern, responsive portfolio website built with Next.js 14+, TypeScript, and Tailwind CSS.

## Features

- **Modern Design**: Clean, professional dark theme
- **Responsive Layout**: Works perfectly on all screen sizes
- **Interactive Components**: Hover effects and smooth transitions
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first CSS framework for rapid styling

## Components

- **Hero**: Main heading and subheading section
- **ProjectCard**: Individual project display with hover effects
- **ProjectsGrid**: Responsive grid layout for projects

## Getting Started

### Prerequisites

Make sure you have Node.js installed on your system.

### Installation

1. Navigate to the project directory:
   ```bash
   cd portfolio-website
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Customization

- Update the name in `Hero.tsx` to your actual name
- Modify the project data in `ProjectsGrid.tsx` to showcase your real projects
- Customize colors and styling in the component files using Tailwind CSS classes

## Project Structure

```
portfolio-website/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── components/
│       ├── Hero.tsx
│       ├── ProjectCard.tsx
│       └── ProjectsGrid.tsx
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```
