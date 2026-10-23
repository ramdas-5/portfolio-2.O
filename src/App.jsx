import KineticGrid from './components/bg.tsx'
import SculptureHero from './components/liquid-sculpture-hero.tsx'
import FloatingDock from './components/floating-dock.tsx'
import { Marquee } from './components/marquee.tsx'
import { TextReveal } from './components/cascade-text.tsx'
import { TextGradientScroll } from './components/text-gradient-scroll.tsx'
import { InteractiveTiltCard } from './components/tilt-card.tsx'
import SplitText from './components/splittext.tsx'
import TargetCursor from './components/targetcursor.tsx'
import { Card3DList } from './components/animated-3d-card.tsx'
import LogoLoop from './components/logoloop.tsx'
import ScrollStack, { ScrollStackItem } from './components/ScrollStack.tsx'
import SpotlightCard from './components/spotlight-card.tsx'
import Timeline from './components/timeline.tsx'
import ScrollReveal from './components/ScrollReveal.tsx'
import { CardSpotlight } from './components/CardSpotlight.tsx'
import BeamBorder from './components/border-beam.tsx'
import Lanyard from './components/Lanyard.tsx'
import { MacbookExperience } from './components/macbook-experience.tsx'
import { WorksWheel } from './components/works-wheel.tsx'
import aboutImage from './components/assest/about-side-image.png'
import fleetraLogo from './components/assest/fleetralogo.png'
import mernCert from './components/assest/Mern.png'
import advancedPythonCert from './components/assest/Advance_Python.png'
import networkingCert from './components/assest/Networking_Basics.png'
import {
  IconHome,
  IconUser,
  IconCode,
  IconBriefcase,
  IconSchool,
  IconFolder,
  IconCertificate,
  IconTool,
} from '@tabler/icons-react'
import {
  Code,
  Layers,
  Palette,
  Sparkles,
  Box,
  GitBranch,
  FileText,
  Database,
  Network,
  Shield,
  TestTube,
  PenTool,
  Rocket,
  ChefHat,
  Server,
} from 'lucide-react'
import {
  SiHtml5,
  SiCss,
  SiJavascript,
  SiTypescript,
  SiPython,
  SiPhp,
  SiGo,
  SiReact,
  SiNextdotjs,
  SiNodedotjs,
  SiExpress,
  SiNestjs,
  SiDjango,
  SiFlask,
  SiFastapi,
  SiSpringboot,
  SiTailwindcss,
  SiMui,
  SiRedux,
  SiPostgresql,
  SiMysql,
  SiMongodb,
  SiSqlite,
  SiGraphql,
  SiDocker,
  SiKubernetes,
  SiGit,
  SiGithub,
  SiGithubactions,
  SiFigma,
  SiStorybook,
  SiPostman,
  SiVitest,
  SiPytest,
} from 'react-icons/si'

const dockItems = [
  { title: 'Home', icon: <IconHome className="h-full w-full text-neutral-600 dark:text-neutral-400" />, href: '#home' },
  { title: 'About', icon: <IconUser className="h-full w-full text-neutral-600 dark:text-neutral-400" />, href: '#about' },
  { title: 'Skill', icon: <IconCode className="h-full w-full text-neutral-600 dark:text-neutral-400" />, href: '#skill' },
  { title: 'Experience', icon: <IconBriefcase className="h-full w-full text-neutral-600 dark:text-neutral-400" />, href: '#experience' },
  { title: 'Education', icon: <IconSchool className="h-full w-full text-neutral-600 dark:text-neutral-400" />, href: '#education' },
  { title: 'Projects', icon: <IconFolder className="h-full w-full text-neutral-600 dark:text-neutral-400" />, href: '#projects' },
  { title: 'Certification', icon: <IconCertificate className="h-full w-full text-neutral-600 dark:text-neutral-400" />, href: '#certification' },
  { title: 'Other Skills', icon: <IconTool className="h-full w-full text-neutral-600 dark:text-neutral-400" />, href: '#other-skills' },
]

const skillsRowOne = ['React', 'Next.js', 'JavaScript', 'TypeScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Vite']
const skillsRowTwo = ['Node.js', 'Git', 'Python', 'SQL', 'MongoDB', 'Figma', 'REST APIs', 'Redux']

const skillCategories = [
  {
    id: 'core-languages',
    title: 'Core Languages',
    icon: <Code />,
    theme: 'info',
    skills: ['HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'Python', 'Java', 'PHP', 'Go'],
  },
  {
    id: 'frameworks-runtime',
    title: 'Frameworks & Runtime',
    icon: <Layers />,
    theme: 'secondary',
    skills: ['React', 'Next.js', 'Vite', 'Node.js', 'Express.js', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Spring Boot'],
  },
  {
    id: 'css-ui-libraries',
    title: 'CSS & UI Libraries',
    icon: <Palette />,
    theme: 'accent',
    skills: ['Tailwind CSS', 'Bootstrap', 'shadcn/ui', 'Material UI (MUI)'],
  },
  {
    id: 'animation-motion',
    title: 'Animation & Motion',
    icon: <Sparkles />,
    theme: 'warning',
    skills: ['Framer', 'Motion', 'GSAP'],
  },
  {
    id: 'graphics-visualization',
    title: 'Graphics & Visualization',
    icon: <Box />,
    theme: 'primary',
    skills: ['Three.js', 'WebGL', 'Canvas API', 'D3.js'],
  },
  {
    id: 'state-management',
    title: 'State Management',
    icon: <GitBranch />,
    theme: 'danger',
    skills: ['Redux Toolkit', 'Zustand'],
  },
  {
    id: 'forms-data',
    title: 'Forms & Data Handling',
    icon: <FileText />,
    theme: 'success',
    skills: ['React Hook Form', 'SQLAlchemy', 'Django ORM'],
  },
  {
    id: 'databases',
    title: 'Databases',
    icon: <Database />,
    theme: 'info',
    skills: ['PostgreSQL', 'MySQL', 'MongoDB', 'SQLite'],
  },
  {
    id: 'apis-communication',
    title: 'APIs & Communication',
    icon: <Network />,
    theme: 'secondary',
    skills: ['REST API', 'GraphQL', 'WebSockets'],
  },
  {
    id: 'auth-security',
    title: 'Authentication & Security',
    icon: <Shield />,
    theme: 'neutral',
    skills: ['JWT', 'OAuth 2.0'],
  },
  {
    id: 'testing-api-tools',
    title: 'Testing & API Tools',
    icon: <TestTube />,
    theme: 'success',
    skills: ['Vitest', 'Postman', 'Pytest'],
  },
  {
    id: 'design-dev-tools',
    title: 'Design & Development Tools',
    icon: <PenTool />,
    theme: 'accent',
    skills: ['Figma', 'Storybook'],
  },
  {
    id: 'devops-deployment',
    title: 'DevOps & Deployment',
    icon: <Rocket />,
    theme: 'warning',
    skills: ['Docker', 'Kubernetes', 'Git', 'GitHub', 'GitHub Actions'],
  },
]

const stackLogos = [
  { node: <SiHtml5 />, title: 'HTML5', href: 'https://developer.mozilla.org/docs/Web/HTML', hoverColor: '#FF6B45' },
  { node: <SiCss />, title: 'CSS3', href: 'https://developer.mozilla.org/docs/Web/CSS', hoverColor: '#5AA9E6' },
  { node: <SiJavascript />, title: 'JavaScript', href: 'https://developer.mozilla.org/docs/Web/JavaScript', hoverColor: '#F7DF1E' },
  { node: <SiTypescript />, title: 'TypeScript', href: 'https://www.typescriptlang.org', hoverColor: '#5B9EF5' },
  { node: <SiPython />, title: 'Python', href: 'https://www.python.org', hoverColor: '#4B8BBE' },
  { node: <SiPhp />, title: 'PHP', href: 'https://www.php.net', hoverColor: '#A6AEE0' },
  { node: <SiGo />, title: 'Go', href: 'https://go.dev', hoverColor: '#00ADD8' },
  { node: <SiReact />, title: 'React', href: 'https://react.dev', hoverColor: '#61DAFB' },
  { node: <SiNextdotjs />, title: 'Next.js', href: 'https://nextjs.org' },
  { node: <SiNodedotjs />, title: 'Node.js', href: 'https://nodejs.org', hoverColor: '#5FA04E' },
  { node: <SiExpress />, title: 'Express.js', href: 'https://expressjs.com' },
  { node: <SiNestjs />, title: 'NestJS', href: 'https://nestjs.com', hoverColor: '#E0234E' },
  { node: <SiDjango />, title: 'Django', href: 'https://www.djangoproject.com', hoverColor: '#44B78B' },
  { node: <SiFlask />, title: 'Flask', href: 'https://flask.palletsprojects.com' },
  { node: <SiFastapi />, title: 'FastAPI', href: 'https://fastapi.tiangolo.com', hoverColor: '#2DD4C4' },
  { node: <SiSpringboot />, title: 'Spring Boot', href: 'https://spring.io/projects/spring-boot', hoverColor: '#6DB33F' },
  { node: <SiTailwindcss />, title: 'Tailwind CSS', href: 'https://tailwindcss.com', hoverColor: '#06B6D4' },
  { node: <SiMui />, title: 'Material UI', href: 'https://mui.com', hoverColor: '#3D9BFF' },
  { node: <SiRedux />, title: 'Redux Toolkit', href: 'https://redux.js.org', hoverColor: '#A97BE0' },
  { node: <SiPostgresql />, title: 'PostgreSQL', href: 'https://www.postgresql.org', hoverColor: '#6E8DF5' },
  { node: <SiMysql />, title: 'MySQL', href: 'https://www.mysql.com', hoverColor: '#6EA3D6' },
  { node: <SiMongodb />, title: 'MongoDB', href: 'https://www.mongodb.com', hoverColor: '#47A248' },
  { node: <SiSqlite />, title: 'SQLite', href: 'https://sqlite.org', hoverColor: '#3D9BE9' },
  { node: <SiGraphql />, title: 'GraphQL', href: 'https://graphql.org', hoverColor: '#FF3FA4' },
  { node: <SiDocker />, title: 'Docker', href: 'https://www.docker.com', hoverColor: '#2496ED' },
  { node: <SiKubernetes />, title: 'Kubernetes', href: 'https://kubernetes.io', hoverColor: '#5C7CFA' },
  { node: <SiGit />, title: 'Git', href: 'https://git-scm.com', hoverColor: '#F05032' },
  { node: <SiGithub />, title: 'GitHub', href: 'https://github.com' },
  { node: <SiGithubactions />, title: 'GitHub Actions', href: 'https://github.com/features/actions' },
  { node: <SiFigma />, title: 'Figma', href: 'https://www.figma.com', hoverColor: '#F24E1E' },
  { node: <SiStorybook />, title: 'Storybook', href: 'https://storybook.js.org', hoverColor: '#FF4785' },
  { node: <SiPostman />, title: 'Postman', href: 'https://www.postman.com', hoverColor: '#FF6C37' },
  { node: <SiVitest />, title: 'Vitest', href: 'https://vitest.dev', hoverColor: '#A3E635' },
  { node: <SiPytest />, title: 'Pytest', href: 'https://pytest.org', hoverColor: '#38BDF8' },
]

const projects = [
  {
    title: 'Fleetra',
    subtitle: 'Smart Bus & Transport Management System',
    description:
      'A professional transport operations platform built with pure PHP, MySQL, Bootstrap 5 and vanilla JavaScript. No frameworks, no build step — it runs directly on XAMPP.',
    tags: ['PHP', 'MySQL', 'Bootstrap 5', 'JavaScript'],
    accent: '#4da3ff',
    image: fleetraLogo,
    imageFit: 'contain',
    links: [
      { label: 'Live', href: 'https://fleetra.xo.je' },
      { label: 'GitHub', href: 'https://github.com/ramdas-5/Fleetra' },
    ],
  },
  {
    title: 'Yumlytic',
    subtitle: 'Recipe Discovery App',
    description:
      'Built with MERN stack featuring user authentication, structured MongoDB database, and backend API integration.',
    tags: ['React', 'Node.js', 'MongoDB', 'Express'],
    accent: '#ffa94d',
    icon: <ChefHat size={64} strokeWidth={1.5} />,
    links: [
      { label: 'Live', href: 'https://recipe-finder-1-8z3b.onrender.com/' },
      { label: 'GitHub', href: 'https://github.com/ramdas-5/Yumlytic' },
    ],
  },
  {
    title: 'File Server',
    subtitle: 'Management System',
    description:
      'Java-based file management system with REST API structure, upload, view & download capabilities.',
    tags: ['Java', 'REST API', 'File System'],
    accent: '#b197fc',
    icon: <Server size={64} strokeWidth={1.5} />,
    links: [{ label: 'GitHub', href: 'https://github.com/ramdas-5/File-Server' }],
  },
]

const educationTimeline = [
  {
    id: 'secondary-2022',
    year: '2022',
    label: '2022 - 2023',
    content:
      'Secondary Education at Monirampore Swami Mahadevananda Vidyatan, Monirampore — 58.42%',
  },
  {
    id: 'diploma-2023',
    year: '2023',
    label: '2023 - 2026',
    content:
      'Diploma in Computer Science & Technology at Kingston Polytechnic College, Barasat — OGPA 8',
  },
  {
    id: 'btech-2026',
    year: '2026',
    label: '2026 - Present',
    content: 'B.Tech in Computer Science & Engineering at Brainware University',
  },
]

const softSkills = [
  'Adaptability',
  'Leadership',
  'Time Management',
  'Problem Solving',
  'Effective Communication',
]

const languages = [
  { title: 'English', subtitle: 'Intermediate', accent: '#4da3ff' },
  { title: 'Hindi', subtitle: 'Fluent', accent: '#ffa94d' },
  { title: 'Bengali', subtitle: 'Native', accent: '#b197fc' },
]

const experiences = [
  {
    id: 'data-annotator',
    role: 'Data Annotator',
    type: 'Full-time',
    company: 'Pripton Innovation',
    points: [
      'Analyzed & labeled data sets for AI model training, ensuring strict adherence to guidelines.',
      'Maintained high accuracy and consistency in data annotation for quality assurance.',
      'Collaborated with team members to manage workflow and meet project deadlines.',
      'Contributed to systematic documentation and reporting of data quality metrics.',
    ],
  },
]

const certifications = [
  { title: 'Mern Stack', image: mernCert },
  { title: 'Advanced Python', image: advancedPythonCert },
  { title: 'Networking basics', image: networkingCert },
  // Resume cover + link, both pointing at the same Cloudinary file: re-uploading
  // there refreshes the card and the link without a rebuild. It is a portrait
  // page of A4 dropped into a landscape frame, so it asks for `fit: "contain"`
  // (see works-wheel) — `cover` would crop it to a sliver across the middle.
  {
    title: 'Resume',
    image:
      'https://res.cloudinary.com/dxsvgn1al/image/upload/v1772568460/Resume_Ramdas_page-0001_xj7vor.jpg',
    href:
      'https://res.cloudinary.com/dxsvgn1al/image/upload/v1772568460/Resume_Ramdas_page-0001_xj7vor.jpg',
    fit: 'contain',
  },
]

function App() {
  return (
    <main>
    <KineticGrid>
      <div id="home">
        <SculptureHero
          brand="Ramdas Hembram"
          eyebrow="Welcome"
          headline={'Ramdas Hembram\nportfolio'}
          headlineAccent=""
          techHeadline
          /* Dark-only site: the light mode swaps the sculpture to light-palette
             materials (near-black silhouette) while `--sh-bg: transparent`
             keeps the rest dark — it could only ever break the hero. */
          themeToggle={false}
          body=""
          primaryCta={null}
          secondaryCta={null}
          backdropText="ramdas"
          theme="dark"
          background="#111110"
          darkBackground="#111110"
          style={{ '--sh-bg': 'transparent' }}
        />
      </div>

      <section className="relative overflow-hidden py-16">
        <Marquee pauseOnHover speed="normal">
          {skillsRowOne.map((skill) => (
            <span
              key={skill}
              className="mx-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent md:text-5xl"
            >
              {skill}
            </span>
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover speed="normal" className="mt-6">
          {skillsRowTwo.map((skill) => (
            <span
              key={skill}
              className="mx-6 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent md:text-5xl"
            >
              {skill}
            </span>
          ))}
        </Marquee>
        {/* edge fades into the page */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#161618] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#161618] to-transparent" />
      </section>

      <section id="about" className="px-6 py-24 md:pl-24 md:pr-10 md:py-32">
        <div className="flex flex-col items-center gap-12 md:flex-row md:gap-16">
          <div className="flex-1">
            <TextReveal
              text="About"
              as="h2"
              color="#f1efea"
              fontSize="3.5rem"
              className="mb-30 "
            />
            <SplitText
              text="Full Stack Web Dev"
              tag="h3"
              className="about-role-text mb-4 font-semibold leading-[1.05] text-white"
              splitType="chars"
              effect="rise"
              staggerFrom="center"
              textAlign="left"
              trigger="view"
              hoverEffect="lift"
              delay={45}
              duration={1.1}
            />
            <TextGradientScroll
              text="Detail-oriented Computer Science student with a strong foundation in data accuracy and process management. Experienced in data handling, quality assurance, and systematic documentation from data annotation and fullstack development projects. Possesses excellent communication skills and a keen eye for detail, aiming to contribute to efficient back-office operations while leveraging technical proficiency in modern software tools."
              type="letter"
              textOpacity="soft"
              className="max-w-4xl text-xl leading-relaxed text-gray-200 md:text-2xl"
            />
          </div>

          <div className="cursor-target h-[460px] w-[340px] shrink-0 sm:h-[480px] sm:w-[380px]" data-cursor-label="About">
            <InteractiveTiltCard
              image={{ src: aboutImage, alt: 'Ramdas Hembram' }}
            />
          </div>
        </div>
      </section>

      <section id="skill" className="px-6 py-24 md:pl-24 md:pr-10 md:py-32">
        <TextReveal
          text="Skills"
          as="h2"
          color="#f1efea"
          fontSize="clamp(1.5rem, 20.5vw, 5rem)"
          className="mb-14"
        />
        <Card3DList
          cards={skillCategories}
          columns={3}
          gap="lg"
          size="sm"
          variant="premium"
        />
      </section>

      <section className="relative overflow-hidden py-14 text-white [&_svg]:drop-shadow-[0_1px_10px_rgba(255,255,255,0.18)]">
        <LogoLoop
          logos={stackLogos}
          speed={100}
          direction="left"
          logoHeight={44}
          gap={52}
          pauseOnHover
          hoverSpeed={0}
          scaleOnHover
          ariaLabel="Technologies I work with"
        />
      </section>

    </KineticGrid>

    {/* Projects uses ScrollStack: its cards pin with `position: sticky`, which
        KineticGrid's `overflow-hidden` wrapper would silently break — so the
        section lives at root level with `relative z-10` (paints above the fixed
        canvas, grid dots still visible behind it). Cards are grayscale until
        the pointer spotlight (ChromaGrid's reveal) brings back color. */}
    <section id="projects" className="relative z-10 py-24 md:py-32">
      <div className="px-6 md:pl-24 md:pr-10">
        <TextReveal
          text="Project"
          as="h2"
          color="#f1efea"
          fontSize="clamp(1.5rem, 15.8vw, 5rem)"
          className="mb-14"
        />
      </div>
      <ScrollStack
        useWindowScroll
        smoothScroll={false}
        stackPosition="12%"
        itemDistance={100}
        itemStackDistance={24}
        dimAmount={0.35}
      >
        {projects.map(project => (
          <ScrollStackItem
            key={project.title}
            style={{
              height: 'auto',
              minHeight: 320,
              padding: 0,
              background: 'transparent',
              boxShadow: 'none',
              color: '#f1efea',
            }}
          >
            <SpotlightCard item={project} />
          </ScrollStackItem>
        ))}
      </ScrollStack>
    </section>

    {/* Education lives outside KineticGrid: its `overflow-hidden` wrapper would
        break the timeline's `position: sticky` pinning. `relative z-10` keeps
        it above the fixed kinetic canvas so the grid dots still show through. */}
    <section id="education" className="relative z-10 py-24 md:py-32">
      <div className="px-6 md:pl-24 md:pr-10">
        <TextReveal
          text="Education"
          as="h2"
          color="#f1efea"
          fontSize="clamp(1.5rem, 12.2vw, 5rem)"
          className="mb-14"
        />
      </div>
      <Timeline
        items={educationTimeline}
        title="Academic Journey"
        periodLabel="2022 — Present"
        textColor="#f1efea"
        mutedTextColor="rgba(241, 239, 234, 0.55)"
        backgroundColor="transparent"
        imageUrl={aboutImage}
        imageAlt="Ramdas Hembram"
      />
    </section>

    {/* Soft Skills — TextReveal heading + ScrollReveal (GSAP word reveal) per
        skill. Lives at root level with `relative z-10` like the neighbouring
        sections, so the fixed kinetic canvas still shows through behind it.
        `mode="enter"` plays the reveal once on scroll-in (scrub mode would
        need much more scroll distance than this short list provides). */}
    <section id="soft-skills" className="relative z-10 px-6 py-24 md:pl-24 md:pr-10 md:py-32">
      <TextReveal
        text="Soft Skills"
        as="h2"
        color="#f1efea"
        fontSize="clamp(1.5rem, 11.5vw, 5rem)"
        className="mb-14"
      />
      <div className="flex max-w-4xl flex-col">
        {softSkills.map(skill => (
          <ScrollReveal
            key={skill}
            mode="enter"
            splitBy="words"
            effect="rise"
            stagger={0.08}
            duration={0.9}
            smoothing={0}
            baseOpacity={0.12}
            baseRotation={2}
            baseOffset={16}
            containerClassName="my-1"
            textClassName="text-[clamp(1.5rem,3.4vw,2.6rem)] leading-[1.4] text-[#f1efea]"
          >
            {skill}
          </ScrollReveal>
        ))}
      </div>
    </section>

    {/* Professional Experience — a large Macbook (macbook-experience.tsx,
        viewport-fit scaled, keyboard deck reused from macbook-scroll.tsx)
        stays FIXED mid-screen with its lid held at a permanent lean-back
        tilt. The BeamBorder card starts exactly on the screen — same box,
        same tilt — and only the card moves: scrolling counter-rotates it to
        upright (straight) while zooming it in 1.2×. The macbook itself never
        animates. */}
    {/* TextReveal renders a single nowrap line (NBSP spaces, 1em mask), so the
        fontSize clamp is load-bearing: at a fixed 5rem this heading is 1128px
        wide and forced the whole page — hero included — into sideways scroll
        on any window narrower than ~1265px. */}
    <section id="experience" className="relative z-10 px-6 py-24 md:pl-24 md:pr-10 md:py-32">
      <TextReveal
        text="Professional Experience"
        as="h2"
        color="#f1efea"
        fontSize="clamp(1.15rem, 5.7vw, 5rem)"
        className="mb-14"
      />
      <MacbookExperience>
        {experiences.map(exp => (
          /* borderRadius={8} + h-full: the card docks onto the macbook screen,
             so its beam and box must match the display's size and rounded-lg
             corners exactly. Layout is forced horizontal (the screen is
             landscape); the lanyard hides below sm to keep the row readable. */
          <BeamBorder key={exp.id} theme="dark" colorVariant="sunset" borderRadius={8} className="h-full">
            <article
              className="cursor-target h-full rounded-lg p-6 md:p-8"
              style={{
                background: 'linear-gradient(180deg, #3a3644 0%, #27242f 100%)',
                boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.07)',
                color: '#f1efea',
              }}
            >
              <div className="flex h-full flex-row items-stretch gap-6 md:gap-8">
                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <header className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="text-[20px] leading-tight font-semibold tracking-[-0.01em] md:text-[22px]">
                      {exp.role}
                    </h3>
                    <span
                      className="rounded-full px-3 py-1 text-[11px] font-semibold"
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: '#f1efea',
                        boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      {exp.type}
                    </span>
                    <span className="ml-auto text-[13px]" style={{ color: 'rgba(241, 239, 234, 0.65)' }}>
                      {exp.company}
                    </span>
                  </header>
                  <ul className="flex flex-col gap-2">
                    {exp.points.map(point => (
                      <li
                        key={point}
                        className="flex gap-3 text-[13px] leading-relaxed"
                        style={{ color: 'rgba(241, 239, 234, 0.7)' }}
                      >
                        <span
                          aria-hidden="true"
                          className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: '#ff8a3d' }}
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Draggable ID-badge lanyard — no front/back images, so the card
                    face stays plain (the ReactBits logo/text only ever lived in
                    the component's demo props). Hidden below sm so the text keeps
                    the whole screen-width card on phones. */}
                <div className="relative hidden h-full shrink-0 sm:block sm:w-[190px] lg:w-[210px]">
                  <Lanyard
                    cardColor="#f1efea"
                    orientation="portrait"
                    finish="glossy"
                    size={0.62}
                    anchor="center"
                    strapLength={0.5}
                    strapColor="#1a1a1e"
                    strapWidth={0.65}
                    metal="gold"
                    interactive
                    intro
                  />
                </div>
              </div>
            </article>
          </BeamBorder>
        ))}
      </MacbookExperience>
    </section>

    {/* Certification & Resume — TextReveal heading + WorksWheel. The wheel
        listens to wheel/drag/arrow keys over its stage and only cancels page
        scroll while it still has items to turn to, so it never traps the reader
        at either end. `h-[70vh]` overrides the component's `h-full` (which would
        collapse — everything inside is absolutely positioned).
        TextReveal renders one nowrap line (NBSP spaces, 1em mask), so the
        fontSize clamp is load-bearing: the heading grew from "Certification" to
        "Certification & Resume" (13.3em of glyph at 800 weight, measured), and
        at the old 8.7vw it ran past the container on anything narrower than
        ~1400px. Same treatment as "Professional Experience" — narrower than it,
        so 5.7vw is roomier for it too. */}
    <section id="certification" className="relative z-10 py-24 md:py-32">
      <div className="px-6 md:pl-24 md:pr-10">
        <TextReveal
          text="Certification & Resume"
          as="h2"
          color="#f1efea"
          fontSize="clamp(1.15rem, 5.7vw, 5rem)"
          className="mb-14"
        />
      </div>
      <WorksWheel
        items={certifications}
        label="Certificates"
        className="h-[70vh]"
      />
    </section>

    {/* Languages — TextReveal heading + CardSpotlight (Aceternity-style
        hover effect): a pointer-tracked radial mask reveals an animated
        blue/purple dot-matrix WebGL shader over the black card, exactly as
        CardSpotlight.tsx renders it. `relative z-20` keeps the text above the
        z-0 overlay. Same root-level `relative z-10` section treatment as the
        neighbours so the fixed kinetic canvas shows through. */}
    <section id="languages" className="relative z-10 px-6 py-24 md:pl-24 md:pr-10 md:py-32">
      <TextReveal
        text="Languages"
        as="h2"
        color="#f1efea"
        fontSize="clamp(1.5rem, 12.2vw, 5rem)"
        className="mb-14"
      />
      <div className="grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {languages.map(language => (
          <CardSpotlight key={language.title}>
            <div className="relative z-20 flex h-full min-h-[88px] flex-col justify-center">
              <h3 className="text-[26px] leading-tight font-semibold tracking-[-0.01em] text-white">
                {language.title}
              </h3>
              <p className="mt-2 text-[15px] leading-snug text-neutral-300">
                {language.subtitle}
              </p>
            </div>
          </CardSpotlight>
        ))}
      </div>
    </section>

    {/* Fixed UI at root level, OUTSIDE <main>: it's chrome, not content — and
        staying root-level keeps KineticGrid's `z-10` stacking context from
        trapping it (later sections would steal its pointer events otherwise). */}
    <TargetCursor
      spinDuration={2}
      hoverDuration={0.2}
      size={36}
      cornerSize={12}
      thickness={3}
      padding={6}
      dotSize={4}
      cursorColor="#ffffff"
      cursorColorOnTarget="#ffffff"
      blendMode="difference"
      parallaxOn
      matchRadius
      showLabel
      clickEffect
      hideDefaultCursor
    />
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <FloatingDock items={dockItems} />
    </div>
    </main>
  )
}

export default App
