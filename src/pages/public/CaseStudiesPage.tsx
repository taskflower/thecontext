import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  ClipboardList,
  Text,
  TrendingUp,
  BookOpen,
  Layers,
  GitFork,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { Trans } from "@lingui/macro";
import TheContextCell from "@/components/public/TheContextCell";

const CaseStudiesPage = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-16 px-0 md:px-6 py-16">
      <header className="text-center mb-16">
        <TheContextCell className="w-12 mb-6" />
        <h1 className="text-4xl font-bold">
          <Trans>THE CONTEXT: Case Studies</Trans>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          <Trans>
            Example scenarios showcasing the use of our task and document management system.
          </Trans>
        </p>
      </header>

      <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex space-x-4 items-end flex-row">
            <ClipboardList className="w-12 h-12 text-primary bg-black stroke-white p-2 rounded" />
            <CardTitle className="text-md font-semibold">
              <Trans>Automated Document Creation</Trans>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              <Trans>
                The process starts with a task requesting a URL address. Then, via API, the page content is prepared, converted to Markdown, and saved as the first document.
              </Trans>
            </p>
            <Button variant="link" className="p-0">
              <Trans>Learn More</Trans>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex space-x-4 items-end flex-row">
            <Text className="w-12 h-12 text-primary bg-black stroke-white p-2 rounded" />
            <CardTitle className="text-md font-semibold">
              <Trans>Marketing Description Generation</Trans>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              <Trans>
                The next task uses the document from the previous step and, with the LLM plugin, generates a marketing description of the website, preparing content for campaigns.
              </Trans>
            </p>
            <Button variant="link" className="p-0">
              <Trans>Learn More</Trans>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex space-x-4 items-end flex-row">
            <TrendingUp className="w-12 h-12 text-primary bg-black stroke-white p-2 rounded" />
            <CardTitle className="text-md font-semibold">
              <Trans>Competitive Analysis and Marketing Strategy</Trans>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              <Trans>
                Subsequent tasks include competitive analysis and developing a marketing strategy based on the prepared documents, ensuring consistency and effectiveness of actions.
              </Trans>
            </p>
            <Button variant="link" className="p-0">
              <Trans>Learn More</Trans>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="my-16 bg-white w-full max-w-3xl m-auto">
        <CardHeader>
          <CardTitle className="text-2xl">
            <Trans>Maintaining Order in the System</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            <Trans>
              A key aspect of our system is maintaining order and separation of documents across different work cycles. This ensures that even when processes are run multiple times, documents from different cycles do not mix, providing clarity and ease of management.
            </Trans>
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <Trans>
                <strong>Data Isolation:</strong> Each work cycle generates unique document identifiers.
              </Trans>
            </li>
            <li>
              <Trans>
                <strong>Task Tracking:</strong> All tasks are linked to their respective documents, enabling easy tracking.
              </Trans>
            </li>
            <li>
              <Trans>
                <strong>Process Automation:</strong> Integration with APIs and LLM plugins automates key stages of document creation.
              </Trans>
            </li>
          </ul>
        </CardContent>
      </section>

      <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Nowe kafelki edukacyjne */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex space-x-4 items-end flex-row">
            <BookOpen className="w-12 h-12 text-primary bg-black stroke-white p-2 rounded" />
            <CardTitle className="text-md font-semibold">
              <Trans>Curriculum-Based Educational Content Generation</Trans>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              <Trans>
                Using the national curriculum as input, the system automatically generates lesson plans,
                worksheets, and educational materials tailored to specific subjects and grade levels,
                ensuring perfect alignment with educational standards.
              </Trans>
            </p>
            <Button variant="link" className="p-0">
              <Trans>Learn More</Trans>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex space-x-4 items-end flex-row">
            <Layers className="w-12 h-12 text-primary bg-black stroke-white p-2 rounded" />
            <CardTitle className="text-md font-semibold">
              <Trans>Multidisciplinary Learning Modules</Trans>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              <Trans>
                The platform integrates concepts from multiple disciplines to create comprehensive
                learning modules that show real-world connections between subjects, fostering
                holistic understanding and critical thinking.
              </Trans>
            </p>
            <Button variant="link" className="p-0">
              <Trans>Learn More</Trans>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex space-x-4 items-end flex-row">
            <GitFork className="w-12 h-12 text-primary bg-black stroke-white p-2 rounded" />
            <CardTitle className="text-md font-semibold">
              <Trans>Automated Curriculum Development Process</Trans>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              <Trans>
                From initial content creation through peer review to final publication,
                the system manages the entire curriculum development lifecycle with automated
                version control and quality assurance checks.
              </Trans>
            </p>
            <Button variant="link" className="p-0">
              <Trans>Learn More</Trans>
            </Button>
          </CardContent>
        </Card>
      </section>

      <footer className="mt-16 text-center">
        <Button size="lg">
          <a href="/contact">
            <Trans>Contact Us</Trans>
          </a>
        </Button>
      </footer>
    </div>
  );
};

export default CaseStudiesPage;
