
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen,  Briefcase, Trophy, Brain, Star } from 'lucide-react';

const CareerPathApp = () => {
 

  const skills = [
    { name: "Programming", progress: 75, category: "Tech" },
    { name: "Data Analysis", progress: 60, category: "Analytics" },
    { name: "UX Design", progress: 45, category: "Design" },
    { name: "Project Management", progress: 80, category: "Business" }
  ];

  const courses = [
    {
      title: "Wprowadzenie do React",
      category: "Programming",
      progress: 80,
      badges: ["Tech", "Frontend"],
      dueDate: "2024-03-01"
    },
    {
      title: "Analiza Danych w Pythonie",
      category: "Data Science",
      progress: 45,
      badges: ["Analytics", "Python"],
      dueDate: "2024-03-15"
    },
    {
      title: "Design Thinking w praktyce",
      category: "Design",
      progress: 30,
      badges: ["UX", "Methods"],
      dueDate: "2024-03-20"
    }
  ];

  const achievements = [
    {
      title: "Full Stack Developer",
      description: "Ukończono ścieżkę rozwoju Full Stack",
      level: "Advanced",
      points: 1500
    },
    {
      title: "Data Analyst",
      description: "Podstawy analizy danych",
      level: "Intermediate",
      points: 1000
    }
  ];

  return (
    <div className="w-full  mx-auto  space-y-4">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">CareerPath Learning</h1>
          <p className="text-gray-500">Twoja spersonalizowana ścieżka rozwoju</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            2500 punktów
          </Badge>
        </div>
      </header>

      <Tabs defaultValue="sciezka" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="sciezka" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" /> Ścieżka
          </TabsTrigger>
          <TabsTrigger value="kursy" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Kursy
          </TabsTrigger>
          <TabsTrigger value="umiejetnosci" className="flex items-center gap-2">
            <Brain className="w-4 h-4" /> Umiejętności
          </TabsTrigger>
          <TabsTrigger value="osiagniecia" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Osiągnięcia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sciezka">
          <Card>
            <CardHeader>
              <CardTitle>Twoja Ścieżka Kariery</CardTitle>
              <CardDescription>Postęp w kierunku Full Stack Developer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {skills.map((skill, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{skill.name}</span>
                      <Badge variant="outline">{skill.category}</Badge>
                    </div>
                    <Progress value={skill.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kursy">
          <div className="grid gap-4">
            {courses.map((course, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription>Kategoria: {course.category}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {course.badges.map((badge, idx) => (
                        <Badge key={idx} variant="secondary">{badge}</Badge>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Progress value={course.progress} className="h-2" />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Postęp: {course.progress}%</span>
                      <span>Termin: {course.dueDate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="umiejetnosci">
          <Card>
            <CardHeader>
              <CardTitle>Mapa Umiejętności</CardTitle>
              <CardDescription>Twój profil kompetencji</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {skills.map((skill, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{skill.name}</span>
                        <Badge>{skill.category}</Badge>
                      </div>
                      <Progress value={skill.progress} className="h-2" />
                      <span className="text-sm text-gray-500">{skill.progress}% opanowania</span>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="osiagniecia">
          <div className="grid gap-4">
            {achievements.map((achievement, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{achievement.title}</CardTitle>
                      <CardDescription>{achievement.description}</CardDescription>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      {achievement.points} pkt
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">{achievement.level}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CareerPathApp;