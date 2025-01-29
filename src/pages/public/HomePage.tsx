// File: src/pages/HomePage.jsx

import { GoalPathwayChart } from "@/components/homepage/GoalPathwayChart";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  FileText,
  Folder,
  Target,
  Shield,
  BarChart2,
  Circle,
  Key,
  Rocket,
  File as FileIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

const HomePage = () => {
  const icons = [Circle, FileIcon, Rocket, BarChart2, Key];

  return (
    <div className="container mx-auto space-y-16 px-6 py-16">
      <header className="mx-auto max-w-2xl text-center space-y-4">
        <h1 className="text-5xl font-bold tracking-tight">
          THE CONTEXT
        </h1>
        <p className="text-lg text-muted-foreground">
          Organize your ads documents and dynamically expand context with structured
          pathways.
        </p>
        {/* /admin/dashboard */}
        
        <Button size="lg" className="mt-4" >
              <Link to="admin/goals">
              Get Started
              </Link>
            </Button>
      </header>

      <section className="grid gap-8 md:grid-cols-2">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl">What is the CONTEXT System?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              This platform enables you to build structured goal pathways that
              expand categorized document structures, ensuring seamless
              knowledge progression towards your objectives.
            </p>
            <GoalPathwayChart icons={icons} />
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl">Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-6 text-muted-foreground">
              <li className="flex items-start space-x-3">
                <FileText className="w-5 h-5 mt-1" />
                <div>
                  <strong>Document Management</strong>
                  <p className="leading-relaxed">
                    Create, edit, and categorize documents to keep everything at your fingertips.
                  </p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Folder className="w-5 h-5 mt-1" />
                <div>
                  <strong>Hierarchical Categorization</strong>
                  <p className="leading-relaxed">
                    Allows logical organization and quick access to files.
                  </p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Target className="w-5 h-5 mt-1" />
                <div>
                  <strong>Dynamic Goal Pathways</strong>
                  <p className="leading-relaxed">
                    Expand context and support efficient pursuit of objectives.
                  </p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Shield className="w-5 h-5 mt-1" />
                <div>
                  <strong>Secure Authentication</strong>
                  <p className="leading-relaxed">
                    Ensures protected access to accounts and data.
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-2xl text-center space-y-4">
        <h2 className="text-3xl font-semibold">Start Your Journey</h2>
        <p className="text-muted-foreground leading-relaxed">
          Streamline your workflow today. Sign up, organize your documents, and
          build pathways to success.
        </p>
        <Button size="lg" className="mt-4">
          Sign Up Now
        </Button>
      </section>
    </div>
  );
};

export default HomePage;
