"use client";

import * as React from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Mail,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import * as d3 from "d3";
import { feature } from "topojson-client";
import type {
  Topology,
  GeometryCollection,
  GeometryObject,
} from "topojson-specification";
import type { GeoPermissibleObjects } from "d3";

const smoothEase = [0.25, 0.1, 0.25, 1] as const;

const EMAIL = "ramdashembram05@gmail.com";
const LOCATION = "Kolkata, India";

// FormSubmit forwards submissions to EMAIL — no account, key or backend needed.
// The inbox owner confirms the activation link once after the first submission.
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${EMAIL}`;

const CONTACT_LINKS: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  external: boolean;
}[] = [
  {
    icon: Mail,
    label: EMAIL,
    href: `mailto:${EMAIL}`,
    external: false,
  },
  {
    icon: MapPin,
    label: LOCATION,
    href: "https://www.google.com/maps/place/Kolkata,+West+Bengal,+India",
    external: true,
  },
  {
    icon: FaLinkedinIn,
    label: "linkedin.com/in/dev-ramdas",
    href: "https://www.linkedin.com/in/dev-ramdas",
    external: true,
  },
  {
    icon: FaGithub,
    label: "github.com/ramdas-5",
    href: "https://github.com/ramdas-5",
    external: true,
  },
];

interface GlobeWireframeProps {
  width?: number;
  height?: number;
  className?: string;
  strokeColor?: string;
  strokeWidth?: number;
  graticuleColor?: string;
  graticuleOpacity?: number;
  sphereOutlineColor?: string;
  sphereOutlineWidth?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  rotateToLocation?: string | [number, number];
  rotateCities?: string[];
  rotationSpeed?: number;
  initialRotation?: [number, number];
  enableInteraction?: boolean;
  showGraticule?: boolean;
  animationDuration?: number;
  startAsGlobe?: boolean;
  countryFillColor?: string;
  countryHoverColor?: string;
  variant?: "wireframe" | "wireframesolid" | "solid";
  scale?: number;
  backgroundColor?: string;
}

interface GeoFeature {
  type: string;
  geometry: GeometryObject;
  properties: Record<string, unknown>;
}

interface WorldAtlasTopology extends Topology {
  objects: {
    countries: GeometryCollection;
  };
}

interface CustomProjection extends d3.GeoProjection {
  alpha(value: number): CustomProjection;
  alpha(): number;
}

const cityCoordinates: Record<string, [number, number]> = {
  "san francisco": [37.7749, -122.4194],
  "new york": [40.7128, -74.006],
  london: [51.5074, -0.1278],
  tokyo: [35.6762, 139.6503],
  paris: [48.8566, 2.3522],
  moscow: [55.7558, 37.6176],
  dubai: [25.2048, 55.2708],
  singapore: [1.3521, 103.8198],
  sydney: [-33.8688, 151.2093],
  mumbai: [19.076, 72.8777],
  kolkata: [22.5726, 88.3639],
  "los angeles": [34.0522, -118.2437],
  chicago: [41.8781, -87.6298],
};

function orthographicRaw(x: number, y: number): [number, number] {
  const cosy = Math.cos(y);
  return [cosy * Math.sin(x), Math.sin(y)];
}

function equirectangularRaw(lambda: number, phi: number): [number, number] {
  return [lambda, phi];
}

function interpolateProjection(
  raw0: (lambda: number, phi: number) => [number, number],
  raw1: (lambda: number, phi: number) => [number, number],
): CustomProjection {
  let t = 0;

  const createRawProjection = (
    alpha: number,
  ): ((lambda: number, phi: number) => [number, number]) => {
    return (lambda: number, phi: number): [number, number] => {
      const [x0, y0] = raw0(lambda, phi);
      const [x1, y1] = raw1(lambda, phi);
      return [x0 + alpha * (x1 - x0), y0 + alpha * (y1 - y0)];
    };
  };

  const projection = d3.geoProjection(
    createRawProjection(t),
  ) as unknown as CustomProjection;

  const alphaMethod = ((value?: number): CustomProjection | number => {
    if (value !== undefined) {
      t = +value;
      const newProjection = d3.geoProjection(
        createRawProjection(t),
      ) as unknown as CustomProjection;

      if (projection.scale()) newProjection.scale(projection.scale());
      if (projection.translate())
        newProjection.translate(projection.translate());
      if (projection.rotate()) newProjection.rotate(projection.rotate());
      if (projection.precision())
        newProjection.precision(projection.precision());

      newProjection.alpha = alphaMethod as CustomProjection["alpha"];

      return newProjection;
    }
    return t;
  }) as CustomProjection["alpha"];

  projection.alpha = alphaMethod;

  return projection;
}

function GlobeWireframe({
  width,
  height,
  className = "aspect-square w-full max-w-150",
  strokeColor = "currentColor",
  strokeWidth = 1.0,
  graticuleColor = "currentColor",
  graticuleOpacity = 0.2,
  sphereOutlineColor = "currentColor",
  sphereOutlineWidth = 1,
  autoRotate = true,
  autoRotateSpeed = 0.5,
  rotateToLocation,
  rotateCities = [],
  rotationSpeed = 3000,
  initialRotation = [0, 0],
  enableInteraction = true,
  showGraticule = true,
  animationDuration = 2000,
  startAsGlobe = true,
  countryFillColor,
  countryHoverColor,
  variant = "wireframe",
  scale = 1,
  backgroundColor,
}: GlobeWireframeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(startAsGlobe ? 0 : 100);
  const [worldData, setWorldData] = useState<GeoFeature[]>([]);
  const [rotation, setRotation] = useState<[number, number]>(initialRotation);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState([0, 0]);
  const [isVisible, setIsVisible] = useState(false);
  const rotationInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const rotationAnimFrame = useRef<number | null>(null);
  const rotationStartTime = useRef<number | null>(null);
  const rotationFrom = useRef<[number, number]>([0, 0]);
  const rotationTo = useRef<[number, number]>([0, 0]);
  const animationFrame = useRef<number | null>(null);
  const [currentCityIndex, setCurrentCityIndex] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const resizeObserver = useRef<ResizeObserver | null>(null);
  const rotationRef = useRef(rotation);

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  const useResponsive = !width && !height;
  const finalWidth = useResponsive ? dimensions.width : width || 800;
  const finalHeight = useResponsive ? dimensions.height : height || 500;

  const defaultStrokeColor = strokeColor || "currentColor";
  const defaultGraticuleColor = graticuleColor || "currentColor";
  const defaultSphereOutlineColor = sphereOutlineColor || "currentColor";
  const defaultCountryFillColor =
    countryFillColor || (variant === "solid" ? "currentColor" : "none");
  const defaultBackgroundColor = backgroundColor || "transparent";

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const updateDimensions = () => {
      if (container && useResponsive) {
        const width = container.offsetWidth || 300;
        setDimensions({ width, height: width });
      }
    };

    updateDimensions();

    if (useResponsive) {
      resizeObserver.current = new ResizeObserver(updateDimensions);
      resizeObserver.current.observe(container);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    observer.observe(container);

    return () => {
      if (resizeObserver.current) {
        resizeObserver.current.disconnect();
      }
      observer.unobserve(container);
    };
  }, [useResponsive]);

  useEffect(() => {
    const loadWorldData = async () => {
      try {
        const response = await fetch(
          "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
        );
        const world = (await response.json()) as WorldAtlasTopology;
        const countries = feature(world, world.objects.countries)
          .features as GeoFeature[];
        setWorldData(countries);
      } catch (error) {
        console.error("Error loading world data:", error);
        const fallbackData: GeoFeature[] = [
          {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [-180, -90],
                  [180, -90],
                  [180, 90],
                  [-180, 90],
                  [-180, -90],
                ],
              ],
            } as unknown as GeometryObject,
            properties: {},
          },
        ];
        setWorldData(fallbackData);
      }
    };
    loadWorldData();
  }, []);

  useEffect(() => {
    if (!autoRotate || !isVisible || isDragging || rotateCities.length > 0) {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
      return;
    }

    const rotate = () => {
      setRotation((prev) => [(prev[0] + autoRotateSpeed) % 360, prev[1]]);
      animationFrame.current = requestAnimationFrame(rotate);
    };

    animationFrame.current = requestAnimationFrame(rotate);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [autoRotate, autoRotateSpeed, isVisible, isDragging, rotateCities.length]);

  const animateRotationTo = useCallback(
    (target: [number, number], duration = 1200) => {
      if (rotationAnimFrame.current) {
        cancelAnimationFrame(rotationAnimFrame.current);
      }

      rotationFrom.current = rotationRef.current;
      rotationTo.current = target;
      rotationStartTime.current = performance.now();

      const animate = (time: number) => {
        const elapsed = time - (rotationStartTime.current || 0);
        const t = Math.min(elapsed / duration, 1);

        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        const lon =
          rotationFrom.current[0] +
          (rotationTo.current[0] - rotationFrom.current[0]) * eased;

        const lat =
          rotationFrom.current[1] +
          (rotationTo.current[1] - rotationFrom.current[1]) * eased;

        setRotation([lon, lat]);

        if (t < 1) {
          rotationAnimFrame.current = requestAnimationFrame(animate);
        }
      };

      rotationAnimFrame.current = requestAnimationFrame(animate);
    },
    [],
  );

  useEffect(() => {
    if (rotateCities.length === 0 || !isVisible) return;

    const rotateToNextCity = () => {
      const nextIndex = (currentCityIndex + 1) % rotateCities.length;
      const city = rotateCities[nextIndex].toLowerCase();
      const coordinates = cityCoordinates[city];

      if (coordinates) {
        animateRotationTo(
          [-coordinates[1], -coordinates[0]],
          rotationSpeed * 0.6,
        );
        setCurrentCityIndex(nextIndex);
      }
    };

    const city = rotateCities[currentCityIndex].toLowerCase();
    const coordinates = cityCoordinates[city];

    if (coordinates) {
      animateRotationTo(
        [-coordinates[1], -coordinates[0]],
        rotationSpeed * 0.6,
      );
    }

    rotationInterval.current = setInterval(rotateToNextCity, rotationSpeed);

    return () => {
      if (rotationInterval.current) clearInterval(rotationInterval.current);
    };
  }, [
    rotateCities,
    currentCityIndex,
    rotationSpeed,
    isVisible,
    animateRotationTo,
  ]);

  useEffect(() => {
    if (!rotateToLocation) return;

    let coordinates: [number, number];
    if (typeof rotateToLocation === "string") {
      const city = rotateToLocation.toLowerCase();
      coordinates = cityCoordinates[city] || [0, 0];
    } else {
      coordinates = rotateToLocation;
    }

    setRotation([-coordinates[1], -coordinates[0]]);
  }, [rotateToLocation]);

  const handleMouseDown = (event: React.MouseEvent) => {
    if (!enableInteraction) return;
    setIsDragging(true);
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      setLastMouse([event.clientX - rect.left, event.clientY - rect.top]);
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragging || !enableInteraction) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentMouse = [event.clientX - rect.left, event.clientY - rect.top];
    const dx = currentMouse[0] - lastMouse[0];
    const dy = currentMouse[1] - lastMouse[1];

    const t = progress / 100;
    let sensitivity: number;

    if (variant === "wireframe") {
      sensitivity = t < 0.5 ? 0.5 : 0.25;
    } else {
      sensitivity = 0.5;
    }

    setRotation((prev) => [
      prev[0] + dx * sensitivity,
      Math.max(-90, Math.min(90, prev[1] - dy * sensitivity)),
    ]);

    setLastMouse(currentMouse);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (!svgRef.current || worldData.length === 0 || !isVisible) return;
    if (useResponsive && dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    let finalCountryFill = "none";
    let finalStrokeWidth = strokeWidth;
    let finalOpacity = 1.0;
    let renderGraticule = showGraticule;
    let finalGraticuleOpacity = graticuleOpacity;
    let finalSphereOutlineWidth = sphereOutlineWidth;

    if (variant === "wireframe") {
      finalCountryFill = "none";
      finalStrokeWidth = strokeWidth;
      finalOpacity = 1.0;
      renderGraticule = showGraticule;
      finalGraticuleOpacity = graticuleOpacity;
      finalSphereOutlineWidth = sphereOutlineWidth;
    } else if (variant === "wireframesolid") {
      finalCountryFill = "none";
      finalStrokeWidth = strokeWidth;
      finalOpacity = 1.0;
      renderGraticule = false;
      finalGraticuleOpacity = 0;
      finalSphereOutlineWidth = 1.5;
    } else if (variant === "solid") {
      finalCountryFill = defaultCountryFillColor;
      finalStrokeWidth = strokeWidth * 0.5;
      finalOpacity = 0.3;
      renderGraticule = false;
      finalGraticuleOpacity = 0;
      finalSphereOutlineWidth = 1.5;
    }

    if (defaultBackgroundColor !== "transparent") {
      const radius = (Math.min(finalWidth, finalHeight) / 2) * scale * 0.9;
      svg
        .append("circle")
        .attr("cx", finalWidth / 2)
        .attr("cy", finalHeight / 2)
        .attr("r", radius)
        .attr("fill", defaultBackgroundColor);
    }

    let projection: d3.GeoProjection | CustomProjection;
    const path = d3.geoPath();

    if (variant === "wireframe") {
      const t = progress / 100;
      const alpha = Math.pow(t, 0.5);

      const baseScale = Math.min(finalWidth, finalHeight) / 2;
      const scaleRange = d3
        .scaleLinear()
        .domain([0, 1])
        .range([baseScale * 0.9 * scale, baseScale * 0.54 * scale]);
      const baseRotate = d3.scaleLinear().domain([0, 1]).range([0, 0]);

      projection = interpolateProjection(orthographicRaw, equirectangularRaw)
        .scale(scaleRange(alpha))
        .translate([finalWidth / 2, finalHeight / 2])
        .rotate([baseRotate(alpha) + rotation[0], rotation[1]])
        .precision(0.1);

      (projection as CustomProjection).alpha(alpha);
      path.projection(projection);
    } else {
      projection = d3
        .geoOrthographic()
        .scale((Math.min(finalWidth, finalHeight) / 2) * scale * 0.9)
        .translate([finalWidth / 2, finalHeight / 2])
        .rotate([rotation[0], rotation[1]])
        .precision(0.1);

      path.projection(projection);
    }

    if (renderGraticule && finalGraticuleOpacity > 0) {
      try {
        const graticule = d3.geoGraticule();
        const graticulePath = path(graticule());
        if (graticulePath) {
          svg
            .append("path")
            .datum(graticule())
            .attr("d", graticulePath)
            .attr("fill", "none")
            .attr("stroke", defaultGraticuleColor)
            .attr("stroke-width", 1)
            .attr("opacity", finalGraticuleOpacity);
        }
      } catch (error) {
        console.error("Error creating graticule:", error);
      }
    }

    svg
      .selectAll(".country")
      .data(worldData)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", (d: GeoFeature) => {
        try {
          const pathString = path(d as unknown as GeoPermissibleObjects);
          if (!pathString) return "";
          if (
            typeof pathString === "string" &&
            (pathString.includes("NaN") || pathString.includes("Infinity"))
          ) {
            return "";
          }
          return pathString;
        } catch (error) {
          return "";
        }
      })
      .attr("fill", finalCountryFill)
      .attr("stroke", defaultStrokeColor)
      .attr("stroke-width", finalStrokeWidth)
      .attr("opacity", finalOpacity)
      .style("visibility", function (this: SVGPathElement) {
        const pathData = d3.select(this).attr("d");
        return pathData && pathData.length > 0 && !pathData.includes("NaN")
          ? "visible"
          : "hidden";
      })
      .on("mouseenter", function (this: SVGPathElement) {
        if (countryHoverColor && variant === "solid") {
          d3.select(this).attr("fill", countryHoverColor);
        }
      })
      .on("mouseleave", function (this: SVGPathElement) {
        if (variant === "solid") {
          d3.select(this).attr("fill", finalCountryFill);
        }
      });

    try {
      const sphereOutline = path({ type: "Sphere" });
      if (sphereOutline) {
        svg
          .append("path")
          .datum({ type: "Sphere" })
          .attr("d", sphereOutline)
          .attr("fill", "none")
          .attr("stroke", defaultSphereOutlineColor)
          .attr("stroke-width", finalSphereOutlineWidth)
          .attr("opacity", variant === "wireframe" ? 1.0 : 0.8);
      }
    } catch (error) {
      console.error("Error creating sphere outline:", error);
    }

    // A small marker pinned to Kolkata, the location shown in the contact list.
    try {
      const home: [number, number] = [88.3639, 22.5726];
      const [rotateLon, rotateLat] = projection.rotate();
      const isHomeVisible =
        d3.geoDistance(home, [-rotateLon, -rotateLat]) < Math.PI / 2;

      if (isHomeVisible) {
        const point = projection(home);
        if (point) {
          const [x, y] = point;
          svg
            .append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", 9)
            .attr("fill", "#ff8a3d")
            .attr("opacity", 0.18);
          svg
            .append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", 3)
            .attr("fill", "#ff8a3d");
        }
      }
    } catch (error) {
      console.error("Error creating location marker:", error);
    }
  }, [
    worldData,
    progress,
    rotation,
    isVisible,
    finalWidth,
    finalHeight,
    defaultStrokeColor,
    strokeWidth,
    defaultGraticuleColor,
    graticuleOpacity,
    defaultSphereOutlineColor,
    sphereOutlineWidth,
    showGraticule,
    defaultCountryFillColor,
    countryHoverColor,
    variant,
    scale,
    defaultBackgroundColor,
    useResponsive,
    dimensions.width,
  ]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <svg
        ref={svgRef}
        width={finalWidth}
        height={finalHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className={
          useResponsive
            ? "w-full h-full opacity-0 transition-opacity duration-1000"
            : ""
        }
        style={{
          cursor: enableInteraction
            ? isDragging
              ? "grabbing"
              : "grab"
            : "default",
          opacity: useResponsive ? (dimensions.width > 0 ? 1 : 0) : 1,
        }}
      />
    </div>
  );
}

const FormDots = React.forwardRef<
  React.ComponentRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref,
  ) => {
    const isHorizontal = orientation === "horizontal";
    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          "shrink-0 flex items-center justify-center overflow-hidden",
          isHorizontal ? "w-full" : "h-full",
          className,
        )}
        {...props}
      >
        <div
          className={cn("relative", isHorizontal ? "w-full h-4" : "h-full w-4")}
        >
          <div
            className={cn(
              "absolute inset-0 bg-repeat",
              "text-white/20",
            )}
            style={{
              backgroundImage:
                "radial-gradient(circle, currentColor 0.8px, transparent 0.8px)",
              backgroundSize: isHorizontal ? "6px 100%" : "100% 6px",
              maskImage: isHorizontal
                ? "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)"
                : "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
            }}
          />
        </div>
      </SeparatorPrimitive.Root>
    );
  },
);
FormDots.displayName = "FormDots";

interface ContactWithGlobeProps {
  title?: string;
  subtitle?: string;
  description?: string;
  className?: string;
}

type SubmitStatus = "idle" | "sending" | "success" | "error";

export default function ContactWithGlobe({
  title = "Let's work together",
  subtitle = "Contact",
  description = "Have a project in mind, a role to discuss, or just want to say hello? My inbox is always open.",
  className,
}: ContactWithGlobeProps) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;

    const subject = `Portfolio enquiry from ${form.name || "someone"}`;

    setStatus("sending");
    setFeedback("");

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
          _subject: subject,
          _replyto: form.email,
          _template: "table",
          _captcha: "false",
          // Honeypot: bots fill this in, humans never see it.
          _honey: "",
        }),
      });

      const result = (await response.json()) as {
        success?: boolean | string;
        message?: string;
      };

      // FormSubmit returns success as the string "true".
      if (response.ok && String(result.success) === "true") {
        setStatus("success");
        setFeedback(
          "Thanks! Your message is on its way — I'll get back to you soon.",
        );
        setForm({ name: "", email: "", message: "" });
      } else {
        // The very first submission is answered with an activation request
        // meant for the inbox owner, so visitors get the generic message.
        console.warn("FormSubmit:", result.message);
        setStatus("error");
        setFeedback("Couldn't send your message. Please try again.");
      }
    } catch {
      setStatus("error");
      setFeedback("Network error — please try again.");
    }
  };

  const isSending = status === "sending";

  return (
    <section
      id="contact"
      className={cn(
        "relative w-full overflow-hidden px-6 py-24 md:pl-24 md:pr-10 md:py-32",
        className,
      )}
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: smoothEase }}
            className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#ff8a3d]/10 border border-[#ff8a3d]/30"
          >
            <span className="text-sm text-[#ff8a3d] font-medium">
              {subtitle}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.15, ease: smoothEase }}
            className="mt-5 text-[clamp(2rem,10vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-[#f1efea]"
          >
            {title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.3, ease: smoothEase }}
            className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#f1efea]/55"
          >
            {description}
          </motion.p>
        </div>

        <div className="mt-14 grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.0, delay: 0.2, ease: smoothEase }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-semibold text-[#f1efea]">
                Get in touch
              </h3>
              <p className="max-w-xs text-sm leading-relaxed text-[#f1efea]/55">
                Reach out via any channel below. I typically reply within one
                business day.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {CONTACT_LINKS.map(({ icon: Icon, label, href, external }, i) => (
                <motion.a
                  key={label}
                  href={href}
                  {...(external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: 0.3 + i * 0.1,
                    ease: smoothEase,
                  }}
                  className="group flex w-fit items-center gap-3 text-sm text-[#f1efea]/60 transition-colors duration-200 hover:text-[#f1efea]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] transition-all duration-200 group-hover:border-[#ff8a3d]/40 group-hover:bg-[#ff8a3d]/10">
                    <Icon className="h-4 w-4 text-[#f1efea]/45 transition-colors duration-200 group-hover:text-[#ff8a3d]" />
                  </div>
                  {label}
                </motion.a>
              ))}
            </div>

            <div className="mt-2 flex justify-center text-[#f1efea]">
              <GlobeWireframe
                className="aspect-square w-full max-w-[340px]"
                variant="wireframesolid"
                autoRotate
                autoRotateSpeed={0.15}
                initialRotation={[-88.3639, -22.5726]}
                strokeColor="rgba(241, 239, 234, 0.85)"
                graticuleColor="rgba(241, 239, 234, 0.35)"
                sphereOutlineColor="rgba(241, 239, 234, 0.9)"
                strokeWidth={0.8}
                graticuleOpacity={0.2}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.0, delay: 0.35, ease: smoothEase }}
            className="flex flex-col gap-5 rounded-2xl border border-white/[0.08] bg-[#161618] p-6 sm:p-8"
          >
            <div>
              <h3 className="mb-0.5 text-lg font-semibold text-[#f1efea]">
                Send a message
              </h3>
              <p className="text-sm text-[#f1efea]/55">
                Fill out the form and I'll get back to you as soon as I can.
              </p>
            </div>

            <FormDots />

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                name="_honey"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="contact-name"
                    className="text-xs font-semibold uppercase tracking-widest text-[#f1efea]/40"
                  >
                    Full Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    disabled={isSending}
                    value={form.name}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="Your name"
                    className="w-full rounded-xl border border-white/[0.08] bg-[#111110] px-4 py-2.5 text-sm text-[#f1efea] placeholder:text-[#f1efea]/30 outline-none transition-all duration-200 focus:border-[#ff8a3d]/50 focus:ring-2 focus:ring-[#ff8a3d]/10"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="contact-email"
                    className="text-xs font-semibold uppercase tracking-widest text-[#f1efea]/40"
                  >
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    disabled={isSending}
                    value={form.email}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        email: event.target.value,
                      }))
                    }
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-white/[0.08] bg-[#111110] px-4 py-2.5 text-sm text-[#f1efea] placeholder:text-[#f1efea]/30 outline-none transition-all duration-200 focus:border-[#ff8a3d]/50 focus:ring-2 focus:ring-[#ff8a3d]/10"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="contact-message"
                  className="text-xs font-semibold uppercase tracking-widest text-[#f1efea]/40"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  required
                  disabled={isSending}
                  rows={5}
                  value={form.message}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      message: event.target.value,
                    }))
                  }
                  placeholder="Tell me about your project or idea"
                  className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#111110] px-4 py-3 text-sm text-[#f1efea] placeholder:text-[#f1efea]/30 outline-none transition-all duration-200 focus:border-[#ff8a3d]/50 focus:ring-2 focus:ring-[#ff8a3d]/10"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={isSending}
                  className="group inline-flex h-11 w-fit items-center gap-2 rounded-xl bg-[#f1efea] px-8 text-sm font-semibold text-[#111110] transition-colors duration-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>

              <div aria-live="polite" role="status">
                {status === "success" && (
                  <div className="flex items-start gap-2 rounded-xl border border-[#ff8a3d]/30 bg-[#ff8a3d]/10 px-4 py-3 text-sm leading-relaxed text-[#ffb07a]">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{feedback}</span>
                  </div>
                )}
                {status === "error" && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-relaxed text-red-300">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      {feedback}{" "}
                      <a
                        href={`mailto:${EMAIL}`}
                        className="font-semibold underline underline-offset-2 transition-colors hover:text-red-200"
                      >
                        Email me directly
                      </a>
                    </span>
                  </div>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
