import { IContainer, IContainerDocument, IContainerRelation, IDocumentSchema } from "./types";

// utils/containerUtils.ts
export class ContainerManager {
    validateSchema(doc: IContainerDocument, schema: IDocumentSchema): boolean {
        return schema.fields.every(field => {
            if (field.required) {
                return doc.customFields[field.name] !== undefined;
            }
            return true;
        });
    }

    validateRelation(relation: IContainerRelation, containers: IContainer[]): boolean {
        const sourceContainer = containers.find(c => c.id === relation.sourceContainerId);
        const targetContainer = containers.find(c => c.id === relation.targetContainerId);

        if (!sourceContainer || !targetContainer) return false;

        // Znajdujemy schematy dla obu kontenerów
        const sourceDoc = sourceContainer.documents.find(d => 
            sourceContainer.schemas.some(s => s.id === d.schemaId)
        );
        const targetDoc = targetContainer.documents.find(d => 
            targetContainer.schemas.some(s => s.id === d.schemaId)
        );

        if (!sourceDoc || !targetDoc) return false;

        // Sprawdzamy czy pola istnieją w schematach
        const sourceSchema = sourceContainer.schemas.find(s => s.id === sourceDoc.schemaId);
        const targetSchema = targetContainer.schemas.find(s => s.id === targetDoc.schemaId);

        if (!sourceSchema || !targetSchema) return false;

        const sourceHasField = sourceSchema.fields.some(f => f.name === relation.sourceField);
        const targetHasField = targetSchema.fields.some(f => f.name === relation.targetField);

        return sourceHasField && targetHasField;
    }

    filterDocumentsByRelation(
        relation: IContainerRelation,
        containers: IContainer[]
    ): IContainerDocument[] {
        const sourceContainer = containers.find(c => c.id === relation.sourceContainerId);
        const targetContainer = containers.find(c => c.id === relation.targetContainerId);

        if (!sourceContainer || !targetContainer) return [];

        return sourceContainer.documents.filter(sourceDoc => {
            return targetContainer.documents.some(targetDoc => {
                const sourceValue = sourceDoc.customFields[relation.sourceField];
                const targetValue = targetDoc.customFields[relation.targetField];

                switch (relation.condition) {
                    case 'equals':
                        return sourceValue === targetValue;
                    case 'greater':
                        return sourceValue > targetValue;
                    case 'less':
                        return sourceValue < targetValue;
                    case 'contains':
                        return String(sourceValue).includes(String(targetValue));
                    default:
                        return false;
                }
            });
        });
    }
}