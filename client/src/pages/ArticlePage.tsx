import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

// Mock article data - replace with backend data later
const articles = {
  "silat-philosophy": {
    id: "silat-philosophy",
    title: "The Philosophy of Pencak Silat",
    author: "Master Ahmad Rahman",
    date: "2024-01-15",
    readTime: "8 min read",
    category: "Philosophy & Culture",
    image: "/placeholder.svg",
    content: `
# Understanding the Core Principles

Pencak Silat is more than just a martial art—it's a complete way of life deeply rooted in Southeast Asian culture and philosophy. The art encompasses physical techniques, mental discipline, and spiritual development.

## The Four Aspects of Silat

### 1. Mental Aspect (Aspek Mental)
The mental aspect focuses on developing inner strength, confidence, and resilience. Practitioners learn to remain calm under pressure and make quick, decisive actions.

### 2. Physical Aspect (Aspek Jasmani)
This involves the development of physical skills, techniques, and conditioning. From basic stances to advanced movements, every technique serves both offensive and defensive purposes.

### 3. Artistic Aspect (Aspek Seni)
Silat is recognized for its graceful, flowing movements that resemble a dance. This artistic expression is seen in traditional performances and ceremonies.

### 4. Spiritual Aspect (Aspek Rohani)
The spiritual dimension emphasizes respect, humility, and the connection between mind, body, and spirit. Many practitioners integrate meditation and breathing exercises into their training.

## Core Values

**Respect (Hormat)**: Showing respect to teachers, fellow students, and opponents is fundamental. This extends beyond the training hall into daily life.

**Discipline (Disiplin)**: Regular training and adherence to principles develop strong character and self-control.

**Perseverance (Ketabahan)**: Success in Silat comes through persistent effort and dedication, never giving up despite challenges.

**Humility (Rendah Hati)**: True masters remain humble, always seeking to learn and improve regardless of their skill level.

## Application in Modern Life

The principles learned in Pencak Silat extend far beyond self-defense. They provide a framework for:

- Building confidence in personal and professional situations
- Developing problem-solving skills through strategic thinking
- Maintaining physical health and mental clarity
- Fostering community connections and cultural appreciation

## Conclusion

Pencak Silat offers a holistic approach to personal development. By embracing its philosophy, practitioners cultivate not just physical prowess, but also mental fortitude and spiritual awareness that enriches all aspects of life.
    `,
  },
  "training-basics": {
    id: "training-basics",
    title: "Essential Training Fundamentals",
    author: "Coach Sarah Lee",
    date: "2024-02-20",
    readTime: "6 min read",
    category: "Training",
    image: "/placeholder.svg",
    content: `
# Building a Strong Foundation

Every journey in Pencak Silat begins with mastering the fundamentals. These basics form the foundation upon which all advanced techniques are built.

## Starting Your Training

### Warm-Up Routine
A proper warm-up is essential to prevent injuries and prepare your body for training:

- Dynamic stretching (10 minutes)
- Joint rotations and mobility work
- Light cardiovascular exercises
- Breathing exercises

### Basic Stances (Kuda-Kuda)

Mastering stances is crucial as they provide stability and power:

1. **Horse Stance (Kuda-Kuda Tengah)**: Foundation for balance and strength
2. **Front Stance (Kuda-Kuda Depan)**: Used for advancing movements
3. **Back Stance (Kuda-Kuda Belakang)**: Defensive positioning
4. **Side Stance (Kuda-Kuda Samping)**: Lateral movement control

### Hand Techniques

Start with these fundamental strikes:

- Straight punch (Pukulan Lurus)
- Circular strike (Pukulan Melingkar)
- Knife hand (Tebak)
- Palm strike (Tamparan)

## Training Schedule

For beginners, we recommend:

- **3-4 sessions per week**: Allow time for recovery
- **1-2 hours per session**: Quality over quantity
- **Focus on form**: Speed and power come with time
- **Regular practice**: Consistency is key

## Progression Path

Your journey typically follows this path:

1. **White Belt (0-6 months)**: Learn basic stances and simple techniques
2. **Yellow Belt (6-12 months)**: Introduce combinations and footwork
3. **Green Belt (1-2 years)**: Develop flowing movements and timing
4. **Blue Belt (2-3 years)**: Master intermediate techniques and forms

## Common Mistakes to Avoid

- Rushing through techniques without proper form
- Neglecting warm-up and cool-down routines
- Training through pain or injury
- Comparing yourself to others instead of focusing on personal growth

## Conclusion

Remember, every master was once a beginner. Stay patient, train consistently, and trust the process.
    `,
  },
  "mental-preparation": {
    id: "mental-preparation",
    title: "Mental Preparation for Testing",
    author: "Coach Michael Tan",
    date: "2024-03-10",
    readTime: "5 min read",
    category: "Testing",
    image: "/placeholder.svg",
    content: `
# Preparing Your Mind for Belt Testing

Belt testing is as much a mental challenge as it is physical. Here's how to prepare your mind for success.

## Weeks Before the Test

### Visualization
Spend 10-15 minutes daily visualizing yourself performing techniques perfectly. See yourself calm, confident, and executing each movement with precision.

### Knowledge Review
- Review all required techniques
- Understand the philosophy behind movements
- Practice verbal explanations of concepts

## Test Day Preparation

### Morning Routine
- Wake up early with plenty of time
- Eat a light, nutritious meal 2-3 hours before
- Stay hydrated
- Light stretching and mobility work

### Managing Nervousness

It's normal to feel nervous. Use these strategies:

**Breathing Exercise**: 4-7-8 technique
- Inhale for 4 seconds
- Hold for 7 seconds
- Exhale for 8 seconds
- Repeat 3-4 times

**Positive Self-Talk**
Replace negative thoughts with empowering statements:
- "I am prepared" instead of "What if I fail?"
- "I've trained for this" instead of "I'm not ready"

## During the Test

### Stay Present
Focus on one technique at a time. Don't think about what's coming next or worry about what you just did.

### Accept Mistakes
If you make a mistake, acknowledge it mentally and move on. Don't let one error derail your entire performance.

### Show Respect
- Bow properly
- Listen carefully to instructions
- Maintain proper etiquette throughout

## After the Test

Regardless of the outcome:
- Show gratitude to your instructors
- Reflect on the experience
- Learn from any mistakes
- Celebrate your courage in testing

## Final Thoughts

Remember, testing is not just about passing or failing. It's about demonstrating your growth, commitment, and understanding of Pencak Silat. Trust your training and believe in yourself.
    `,
  },
};

const ArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const article = id ? articles[id as keyof typeof articles] : null;

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The article you're looking for doesn't exist.
          </p>
          <Link to="/library">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Library
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Link to="/library">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Library
          </Button>
        </Link>

        {/* Article Header */}
        <header className="mb-8">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              {article.category}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {article.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(article.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{article.readTime}</span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="mb-12 rounded-lg overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-[400px] object-cover"
          />
        </div>

        {/* Article Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {article.content.split("\n").map((line, index) => {
            if (line.startsWith("# ")) {
              return (
                <h1 key={index} className="text-3xl font-bold mt-8 mb-4">
                  {line.substring(2)}
                </h1>
              );
            } else if (line.startsWith("## ")) {
              return (
                <h2 key={index} className="text-2xl font-bold mt-6 mb-3">
                  {line.substring(3)}
                </h2>
              );
            } else if (line.startsWith("### ")) {
              return (
                <h3 key={index} className="text-xl font-bold mt-4 mb-2">
                  {line.substring(4)}
                </h3>
              );
            } else if (line.startsWith("**") && line.endsWith("**")) {
              return (
                <p key={index} className="font-bold mt-4">
                  {line.substring(2, line.length - 2)}
                </p>
              );
            } else if (line.startsWith("- ")) {
              return (
                <li key={index} className="ml-6 my-2">
                  {line.substring(2)}
                </li>
              );
            } else if (line.match(/^\d+\.\s/)) {
              return (
                <li key={index} className="ml-6 my-2 list-decimal">
                  {line.substring(line.indexOf(" ") + 1)}
                </li>
              );
            } else if (line.trim() === "") {
              return <br key={index} />;
            } else {
              return (
                <p key={index} className="my-4 leading-relaxed">
                  {line}
                </p>
              );
            }
          })}
        </div>

        {/* Article Footer */}
        <div className="mt-12 pt-8 border-t">
          <Link to="/library">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Library
            </Button>
          </Link>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default ArticlePage;
