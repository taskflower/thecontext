    // src/modules/flowPlayer/components/Controls/FlowControls.tsx
    import React, { useMemo } from "react";
    import { Button } from "@/components/ui/button";
    import { ArrowRight, ArrowLeft, RotateCcw, CheckCircle } from "lucide-react";
    import { Card, CardContent } from "@/components/ui/card";
    import { useFlowPlayer } from "../../context/FlowContext";

    export const FlowControls: React.FC = React.memo(() => {
    const { 
        currentNode, 
        currentNodeIndex, 
        flowPath,
        nextNode, 
        previousNode,
        resetFlow,
        isProcessing
    } = useFlowPlayer();
    
    // Compute navigation state once per render
    const { isFirst, isLast, nodeLabel } = useMemo(() => ({
        isFirst: currentNodeIndex === 0,
        isLast: currentNodeIndex === flowPath.length - 1,
        nodeLabel: currentNode?.label || "Unknown"
    }), [currentNode, currentNodeIndex, flowPath.length]);
    
    return (
        <Card className="mb-6 flow-controls">
        <CardContent className="pt-4">
            <div className="flex items-center justify-between">
            <div className="space-x-2">
                <Button
                variant="outline"
                size="sm"
                onClick={resetFlow}
                disabled={!currentNode || isProcessing}
                >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
                </Button>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                {currentNode ? (
                    <>
                    <span className="font-medium">{nodeLabel}</span>
                    <span className="mx-2">•</span>
                    Node {currentNodeIndex + 1} of {flowPath.length}
                    </>
                ) : (
                    <>Select a flow to start</>
                )}
                </div>
                
                <div className="space-x-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={previousNode}
                    disabled={!currentNode || isFirst || isProcessing}
                    aria-label="Previous node"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                
                <Button
                    variant={isLast ? "default" : "outline"}
                    size="icon"
                    onClick={() => nextNode()}
                    disabled={!currentNode || isProcessing}
                    aria-label={isLast ? "End flow" : "Next node"}
                >
                    {isLast ? (
                    <CheckCircle className="h-4 w-4" />
                    ) : (
                    <ArrowRight className="h-4 w-4" />
                    )}
                </Button>
                </div>
            </div>
            </div>
        </CardContent>
        </Card>
    );
    });

    // Set display name for better debugging
    FlowControls.displayName = 'FlowControls';