import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  ArticleBlocksRenderer,
  type ArticleBlock,
} from "@/components/articles/ArticleBlocksSystem";

/* Mock article with blocks (replace with backend later) */
const articles: Record<
  string,
  {
    id: string;
    title: string;
    author: string;
    date: string;
    readTime: string;
    category: string;
    image: string;
    blocks: ArticleBlock[];
  }
> = {
  "silat-philosophy": {
    id: "silat-philosophy",
    title: "The Philosophy of Pencak Silat",
    author: "Master Ahmad Rahman",
    date: "2024-01-15",
    readTime: "8 min read",
    category: "Philosophy & Culture",
    image: "/placeholder.svg",
    blocks: [
      {
        id: "b1",
        type: "title",
        text: "Understanding the Core Principles",
      },
      {
        id: "b2",
        type: "paragraph",
        text: "Pencak Silat is more than just a martial art—it's a complete way of life deeply rooted in Southeast Asian culture and philosophy.",
      },
      {
        id: "b3",
        type: "image",
        url: "/placeholder.svg",
        caption: "Traditional Silat movement",
      },
      {
        id: "b4",
        type: "title",
        text: "Core Values",
      },
      {
        id: "b5",
        type: "list",
        items: ["Respect", "Discipline", "Perseverance", "Humility"],
      },
      {
        id: "b6",
        type: "note",
        text: "Silat is not about domination, but about self-mastery and harmony.",
      },
    ],
  },
};

const ArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const article = id ? articles[id] : null;

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
        {/* Back */}
        <Link to="/library">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Library
          </Button>
        </Link>

        {/* Header */}
        <header className="mb-8">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            {article.category}
          </span>

          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {article.title}
          </h1>

          <div className="flex flex-wrap gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {article.author}
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(article.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {article.readTime}
            </div>
          </div>
        </header>

        {/* Cover Image */}
        <div className="mb-12 rounded-lg overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-[400px] object-cover"
          />
        </div>

        {/* Blocks Content */}
        <section className="space-y-10">
          <ArticleBlocksRenderer blocks={article.blocks} />
        </section>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t">
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
