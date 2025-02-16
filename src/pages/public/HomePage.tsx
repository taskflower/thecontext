import { GoalPathwayChart } from "@/components/homepage/GoalPathwayChart";
import TheContextCell from "@/components/homepage/TheContextCell";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, Brain, GitBranch, Layout } from "lucide-react";
import { ReactNode } from "react";
import { AppLink } from "@/components/AppLink";
import { Trans } from "@lingui/macro";

const Hl = ({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "yellow" | "green";
}) => {
  const gradients = {
    default: "from-primary/5 to-primary/0",
    yellow: "from-yellow-50/50 to-yellow-50/0",
    green: "from-green-100/50 to-green-100/0",
  };

  return (
    <span className={`bg-gradient-to-r ${gradients[variant]} px-1 rounded`}>
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

        <p className="py-2 text-base sm:text-md text-muted-foreground">
          <Trans>
            Your <Hl variant="yellow">AI-powered workflow platform</Hl> for
            <Hl variant="yellow">automating complex business processes.</Hl>
            From marketing campaigns to career planning, turn any business case
            into an actionable, AI-guided workflow.
          </Trans>
        </p>
        <AppLink to="/tasks/templates" admin>
          <Button size="lg" className="mt-4">
            <Trans>Create Your Workflow</Trans>
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
                THE CONTEXT is a platform that automates your business workflows
                using AI. Upload your content, set your goals, and let our AI
                analyze and execute tasks automatically. The system learns from
                your data to deliver increasingly personalized results.
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
          <Hl variant="green">
            <strong className="text-black">
              <Trans>AI Workflow Management</Trans>
            </strong>
          </Hl>
          <p className="leading-relaxed">
            <Trans>
              Manage your AI agents like a team using our intuitive
              Kanban board. Track progress and oversee multiple
              processes seamlessly.
            </Trans>
          </p>
        </div>
      </li>
      <li className="flex items-start space-x-3">
        <GitBranch className="w-8 h-8 mt-1" />
        <div>
          <Hl variant="green">
            <strong className="text-black">
              <Trans>Business Case Templates</Trans>
            </strong>
          </Hl>
          <p className="leading-relaxed">
            <Trans>
              Convert any business scenario into an automated workflow
              with pre-built or custom templates.
            </Trans>
          </p>
        </div>
      </li>
      <li className="flex items-start space-x-3">
        <Brain className="w-8 h-8 mt-1" />
        <div>
          <Hl variant="green">
            <strong className="text-black">
              <Trans>AI Agents & Learning</Trans>
            </strong>
          </Hl>
          <p className="leading-relaxed">
            <Trans>
              Smart AI agents learn from your documents while executing
              tasks, building specialized knowledge for your business.
            </Trans>
          </p>
        </div>
      </li>
      <li className="flex items-start space-x-3">
        <FileText className="w-8 h-8 mt-1" />
        <div>
          <Hl variant="green">
            <strong className="text-black">
              <Trans>Smart Document Processing</Trans>
            </strong>
          </Hl>
          <p className="leading-relaxed">
            <Trans>
              Automatically analyze and extract insights from your
              documents - websites, PDFs, and spreadsheets.
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
          <Trans>Ready to Automate Your Business Processes?</Trans>
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          <Trans>
            Transform your business cases into <Hl>automated workflows</Hl>. Let
            our <Hl>AI agents</Hl> handle the heavy lifting while building a{" "}
            <Hl>specialized knowledge base</Hl> for your needs. From{" "}
            <Hl>marketing campaigns</Hl> to <Hl>career development</Hl>, see how
            AI can streamline your processes today.
          </Trans>
        </p>
        <AppLink to="/tasks/templates" admin>
          <Button size="lg" className="mt-4">
            <Trans>Start Your First Project</Trans>
          </Button>
        </AppLink>
      </section>
    </div>
  );
};

export default HomePage;
