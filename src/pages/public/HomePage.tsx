// HomePage.tsx
import { GoalPathwayChart } from "@/components/homepage/GoalPathwayChart";
import TheContextCell from "@/components/homepage/TheContextCell";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, Brain, GitBranch, Layout } from "lucide-react";
import { ReactNode } from "react";
import { AppLink } from "@/components/AppLink";
import { Trans } from "@lingui/macro";

const HighlightedText = ({ children }: { children: ReactNode }) => {
  return (
    <span className="bg-gradient-to-r from-primary/5 to-primary/0 px-1 rounded">
      {children}
    </span>
  );
};

const HomePage = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-16 px-0 md:px-6 py-16">
      <header className="mx-auto max-w-3xl text-center space-y-4">
        <div className="flex md:items-end justify-center gap-6 flex-col md:flex-row">
          <TheContextCell className="h-20 mb-1" />
          <h1 className="font-bold tracking-tight text-4xl sm:text-6xl md:text-7xl xl:text-8xl">
            <Trans>THE CONTEXT</Trans>
          </h1>
        </div>

        <p className="py-2 text-base sm:text-lg text-muted-foreground">
          <Trans>
            Build and expand your knowledge context through structured task
            templates, interactive Kanban boards, and AI-powered document
            management.
          </Trans>
        </p>
        <AppLink to="/tasks/templates" admin>
          <Button size="lg" className="mt-4">
            <Trans>Start Building</Trans>
          </Button>
        </AppLink>
      </header>

      <section className="grid gap-8 md:grid-cols-2">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">
              <Trans>What is THE CONTEXT?</Trans>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6 leading-relaxed text-muted-foreground">
              <Trans>
                Context Builder is an intelligent task management system that
                combines customizable templates, Kanban workflows, and AI-powered
                document context expansion. It helps you create structured
                pathways for complex tasks while automatically building and
                maintaining relevant knowledge context.
              </Trans>
            </p>
            <GoalPathwayChart />
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">
              <Trans>Core Features</Trans>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-6 text-muted-foreground">
              <li className="flex items-start space-x-3">
                <Layout className="w-8 h-8 mt-1" />
                <div>
                  <strong>
                    <Trans>Kanban Task Management</Trans>
                  </strong>
                  <p className="leading-relaxed">
                    <Trans>
                      Create and manage task workflows with customizable templates
                      and dependency tracking through an intuitive Kanban board
                      interface.
                    </Trans>
                  </p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <GitBranch className="w-8 h-8 mt-1" />
                <div>
                  <strong>
                    <Trans>Process Templates</Trans>
                  </strong>
                  <p className="leading-relaxed">
                    <Trans>
                      Design reusable task templates with step-by-step processes,
                      dependencies, and integrated plugins for consistent workflow
                      execution.
                    </Trans>
                  </p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Brain className="w-8 h-8 mt-1" />
                <div>
                  <strong>
                    <Trans>Context Expansion</Trans>
                  </strong>
                  <p className="leading-relaxed">
                    <Trans>
                      AI-powered system that automatically expands and maintains
                      document context as you work through tasks and templates.
                    </Trans>
                  </p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <FileText className="w-8 h-8 mt-1" />
                <div>
                  <strong>
                    <Trans>Smart Document Management</Trans>
                  </strong>
                  <p className="leading-relaxed">
                    <Trans>
                      Intelligent document handling that grows with your tasks,
                      creating a dynamic knowledge base tied to your workflows.
                    </Trans>
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-2xl text-center space-y-4">
        <h2 className="font-semibold text-2xl sm:text-3xl">
          <Trans>Ready to Expand Your Context?</Trans>
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          <Trans>
            Start building your <HighlightedText>knowledge base</HighlightedText>{" "}
            today with our{" "}
            <HighlightedText>intelligent task management</HighlightedText> and{" "}
            <HighlightedText>context expansion</HighlightedText> system.{" "}
            <HighlightedText>Create templates</HighlightedText>,{" "}
            <HighlightedText>manage workflows</HighlightedText>, and watch your
            document context <HighlightedText>grow naturally</HighlightedText>.
          </Trans>
        </p>
        <AppLink to="/tasks/templates" admin>
          <Button size="lg" className="mt-4">
            <Trans>Create Your First Template</Trans>
          </Button>
        </AppLink>
      </section>
    </div>
  );
};

export default HomePage;