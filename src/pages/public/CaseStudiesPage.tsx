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
    GitFork 
  } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import TheContextCell from "@/components/homepage/TheContextCell";
  
  const CaseStudiesPage = () => {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <header className="text-center mb-16">
          <TheContextCell className="w-12 mb-6" />
          <h1 className="text-4xl font-bold">THE CONTEXT: Case Studies</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Example scenarios showcasing the use of our task and document management system.
          </p>
        </header>
  
        <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex space-x-4 items-end flex-row">
              <ClipboardList className="w-12 h-12 text-primary bg-black stroke-white p-2 rounded" />
              <CardTitle className="text-md font-semibold">Automated Document Creation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                The process starts with a task requesting a URL address. Then, via API, the page content is prepared, converted to Markdown, and saved as the first document.
              </p>
              <Button variant="link" className="p-0">Learn More</Button>
            </CardContent>
          </Card>
  
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex space-x-4 items-end flex-row">
              <Text className="w-12 h-12 text-primary bg-black stroke-white p-2 rounded" />
              <CardTitle className="text-md font-semibold">Marketing Description Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                The next task uses the document from the previous step and, with the LLM plugin, generates a marketing description of the website, preparing content for campaigns.
              </p>
              <Button variant="link" className="p-0">Learn More</Button>
            </CardContent>
          </Card>
  
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex space-x-4 items-end flex-row">
              <TrendingUp className="w-12 h-12 text-primary bg-black stroke-white p-2 rounded" />
              <CardTitle className="text-md font-semibold">Competitive Analysis and Marketing Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Subsequent tasks include competitive analysis and developing a marketing strategy based on the prepared documents, ensuring consistency and effectiveness of actions.
              </p>
              <Button variant="link" className="p-0">Learn More</Button>
            </CardContent>
          </Card>
  
         
        </section>
  
        <section className="my-16 bg-white w-full max-w-3xl m-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Maintaining Order in the System</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              A key aspect of our system is maintaining order and separation of documents across different work cycles. This ensures that even when processes are run multiple times, documents from different cycles do not mix, providing clarity and ease of management.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Data Isolation:</strong> Each work cycle generates unique document identifiers.</li>
              <li><strong>Task Tracking:</strong> All tasks are linked to their respective documents, enabling easy tracking.</li>
              <li><strong>Process Automation:</strong> Integration with APIs and LLM plugins automates key stages of document creation.</li>
            </ul>
          </CardContent>
        </section>

        <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
             {/* Nowe kafelki edukacyjne */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex space-x-4 items-end flex-row">
              <BookOpen className="w-12 h-12 text-primary bg-black stroke-white p-2 rounded" />
              <CardTitle className="text-md font-semibold">Curriculum-Based Educational Content Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Using the national curriculum as input, the system automatically generates lesson plans,
                worksheets, and educational materials tailored to specific subjects and grade levels,
                ensuring perfect alignment with educational standards.
              </p>
              <Button variant="link" className="p-0">Learn More</Button>
            </CardContent>
          </Card>
  
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex space-x-4 items-end flex-row">
              <Layers className="w-12 h-12 text-primary bg-black stroke-white p-2 rounded" />
              <CardTitle className="text-md font-semibold">Multidisciplinary Learning Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                The platform integrates concepts from multiple disciplines to create comprehensive
                learning modules that show real-world connections between subjects, fostering
                holistic understanding and critical thinking.
              </p>
              <Button variant="link" className="p-0">Learn More</Button>
            </CardContent>
          </Card>
  
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex space-x-4 items-end flex-row">
              <GitFork className="w-12 h-12 text-primary bg-black stroke-white p-2 rounded" />
              <CardTitle className="text-md font-semibold">Automated Curriculum Development Process</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                From initial content creation through peer review to final publication,
                the system manages the entire curriculum development lifecycle with automated
                version control and quality assurance checks.
              </p>
              <Button variant="link" className="p-0">Learn More</Button>
            </CardContent>
          </Card>
        </section>
  
        <footer className="mt-16 text-center">
          <Button size="lg">
            <a href="/contact">Contact Us</a>
          </Button>
        </footer>
      </div>
    );
  };
  
  export default CaseStudiesPage;