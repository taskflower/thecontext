import { FC } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"; // Ensure the path is correct

interface InvalidTemplateProps {
  onBack: () => void;
}

const InvalidTemplate: FC<InvalidTemplateProps> = ({ onBack }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleEditClick = () => {
    navigate(`/admin/tasks/${id}/edit`);
  };

  return (
    <div className="flex justify-center items-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-col items-center text-center border-b">
          <AlertTriangle className="h-6 w-6 mb-2" />
          <h2 className="text-xl font-bold">Invalid Template</h2>
          <p className="text-muted-foreground text-sm">
            The task you are trying to run does not have defined steps in this template.
          </p>
        </CardHeader>
        <CardContent className="text-center w-96  m-auto pt-6">
         
          <p className="text-lg">
            Add steps to the template or choose another template.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4 pt-6 border-t">
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
          <Button onClick={handleEditClick}>
            Add Steps to Template
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default InvalidTemplate;
