/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/scenario_vizualizer/ScenarioVisualization.tsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useScenarioStore } from '../scenarios_module/scenarioStore';

interface ScenarioVisualizationProps {
  onNodeClick?: (id: string) => void;
}

const ScenarioVisualization: React.FC<ScenarioVisualizationProps> = ({ onNodeClick }) => {
  const { nodes, edges, nodeResponses } = useScenarioStore();
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 600;

    // Czyszczenie poprzedniej wizualizacji
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('style', 'max-width: 100%; height: auto;');

    // Warstwy do kontrolowania kolejności renderowania
    const linksLayer = svg.append('g').attr('class', 'links-layer');
    const nodesLayer = svg.append('g').attr('class', 'nodes-layer');

    const nodeData = Object.values(nodes).map(node => ({
      id: node.id,
      category: node.category,
      message: node.message,
      hasResponse: !!nodeResponses[node.id]
    }));

    const edgeData = edges.map(edge => ({
      source: edge.source,
      target: edge.target
    }));

    // Wymiary boxa
    const boxWidth = 150;
    const boxHeight = 70;

    // Symulacja sił do wyliczenia początkowych pozycji
    const simulation = d3.forceSimulation(nodeData as any)
      .force('link', d3.forceLink(edgeData).id((d: any) => d.id).distance(200))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(boxWidth / 1.5))
      .alphaDecay(0.05) // Szybsze wygaszanie
      .alpha(0.3); // Niższa wartość alpha dla szybszego ustalania pozycji
    
    // Wykonanie symulacji na określoną liczbę ticków, bez animacji
    simulation.tick(50);
    simulation.stop();
    
    // Utrwalenie pozycji węzłów
    nodeData.forEach((node: any) => {
      node.fx = node.x;
      node.fy = node.y;
    });

    // Skala kolorów dla kategorii
    const categorySet = new Set(nodeData.map(node => node.category));
    const categories = Array.from(categorySet);
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(categories);

    // Definicje filtrów i markerów
    const defs = svg.append('defs');
    defs.append('filter')
      .attr('id', 'drop-shadow')
      .attr('height', '130%')
      .append('feDropShadow')
      .attr('dx', 2)
      .attr('dy', 2)
      .attr('stdDeviation', 3)
      .attr('flood-opacity', 0.2);

    defs.append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20) // Dopasowane, aby strzałki dotykały krawędzi boxa
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('fill', '#999')
      .attr('d', 'M0,-5L10,0L0,5');

    // Funkcja pomocnicza obliczająca punkt przecięcia linii i prostokąta
    function getIntersection(source: any, target: any) {
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const unitDx = dx / length;
      const unitDy = dy / length;
      const w = boxWidth / 2;
      const h = boxHeight / 2;
      const t1 = Math.abs(w / unitDx);
      const t2 = Math.abs(h / unitDy);
      const t = Math.min(t1, t2) - 2; // Odejmujemy małą wartość, aby strzałka dotykała krawędzi
      return {
        x: target.x - unitDx * t,
        y: target.y - unitDy * t
      };
    }

    // Rysowanie linii (linków) - warstwa poniżej
    linksLayer.selectAll('path')
      .data(edgeData)
      .enter()
      .append('path')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.5)
      .attr('fill', 'none')
      .attr('marker-end', 'url(#arrow)')
      .attr('d', (d: any) => {
        const sourcePoint = {x: d.source.x, y: d.source.y};
        const targetPoint = getIntersection(d.source, d.target);
        const dx = targetPoint.x - sourcePoint.x;
        const dy = targetPoint.y - sourcePoint.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.5; // Dopasowanie krzywizny
        return `M${sourcePoint.x},${sourcePoint.y}A${dr},${dr} 0 0,1 ${targetPoint.x},${targetPoint.y}`;
      });

    // Rysowanie węzłów - warstwa powyżej
    const nodeGroups = nodesLayer.selectAll('g')
      .data(nodeData)
      .enter()
      .append('g')
      .attr('cursor', 'pointer')
      .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`)
      .on('click', (event, d) => {
        event.stopPropagation();
        if (onNodeClick) onNodeClick(d.id);
      });
    
    // Dodanie linii pod boxem, aby była na spodzie
    nodeGroups.append('line')
      .attr('x1', -boxWidth / 2)
      .attr('y1', boxHeight / 2 + 3)
      .attr('x2', boxWidth / 2)
      .attr('y2', boxHeight / 2 + 3)
      .attr('stroke', '#ddd')
      .attr('stroke-width', 1);
    
    // Dodanie prostokąta węzła
    nodeGroups.append('rect')
      .attr('width', boxWidth)
      .attr('height', boxHeight)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('x', -boxWidth / 2)
      .attr('y', -boxHeight / 2)
      .attr('fill', (d: any) => `${colorScale(d.category)}30`)
      .attr('stroke', (d: any) => d.hasResponse ? '#22c55e' : colorScale(d.category) as string)
      .attr('stroke-width', 1)
      .attr('filter', 'url(#drop-shadow)');

    // Dodanie tekstu z ID węzła (góra boxa)
    nodeGroups.append('text')
      .text((d: any) => d.id)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('y', -boxHeight / 4)
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', (d: any) => colorScale(d.category) as string);

    // Dodanie opakowanego tekstu wiadomości (dół boxa)
    nodeGroups.each(function(d: any) {
      const node = d3.select(this);
      const message = d.message;
      const charsPerLine = Math.floor(boxWidth / 6);
      const words = message.split(' ');
      let lines = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        if (testLine.length <= charsPerLine) {
          currentLine = testLine;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
      if (lines.length > 2) {
        lines = lines.slice(0, 2);
        lines[1] = lines[1].substring(0, lines[1].length - 3) + '...';
      }
      
      lines.forEach((line, i) => {
        node.append('text')
          .text(line)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('y', boxHeight / 8 + i * 12)
          .attr('font-size', '10px')
          .attr('fill', '#333');
      });
    });

    // Dodanie odznaki kategorii (małe kółko)
    nodeGroups.append('circle')
      .attr('r', 4)
      .attr('cx', boxWidth / 2 - 10)
      .attr('cy', -boxHeight / 2 + 10)
      .attr('fill', (d: any) => colorScale(d.category) as string);

    // Dodanie wskaźnika odpowiedzi, jeśli istnieje
    nodeGroups.filter((d: any) => d.hasResponse)
      .append('circle')
      .attr('r', 4)
      .attr('cx', -boxWidth / 2 + 10)
      .attr('cy', -boxHeight / 2 + 10)
      .attr('fill', '#22c55e')
      .attr('stroke', 'white')
      .attr('stroke-width', 0.5);

    return () => {
      simulation.stop();
    };
  }, [nodes, edges, nodeResponses, onNodeClick]);

  return (
    <svg ref={svgRef} className="w-full h-96 border bg-white"></svg>
  );
};

export default ScenarioVisualization;
