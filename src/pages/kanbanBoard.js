import { useEffect, useState } from "react";
//import { Card } from "antd";
import KanbanColumn from "../temp/KanbanColumn";

const KanbanBoard = ({job}) => {
  const [stages, setStages] = useState([]);
  const [jobCandidates , setJobCandidates] = useState([]);

  useEffect(() => {
    fetch("/hiring_pipeline.json") 
      .then((response) => response.json())
      .then((data) => {
      
        const jobPipeline = data.jobs.find(pipeline => pipeline.job_title === job);
        
        // Filter only top-level stages (ignoring sub-stages)
        const filteredStages = jobPipeline.pipeline.filter(stage => !stage.parent_progress_id);
        setStages(filteredStages);
      })
      .catch((error) => console.error("Error loading pipeline:", error));

      fetch("/candidates.json").then((response) => response.json()).then((data)=>{
        console.log("Fetched Candidates:", data);
        const currentJobCandidates = data.candidates.filter(candidate => 
            candidate.applied_jobs.some(canJob => canJob.job_title === job)
          );
          
        console.log("Filtered Candidates:", currentJobCandidates);
        setJobCandidates(currentJobCandidates);
      }).catch((error) => console.error("error fetching candidates",error));
  }, [job]); 
    
  const onDragStart = (e, candidateId) => {
    e.dataTransfer.setData("candidateId", candidateId);
  };

  const onDragOver = (e) => {   
    e.preventDefault();         
  };

  const onDrop = (e, newStatus) => {
    const candidateId = e.dataTransfer.getData("candidateId");

    setJobCandidates((prevCandidates) =>
      prevCandidates.map((candidate) =>
        candidate.id === candidateId ? { ...candidate, progress: newStatus } : candidate
      )
    );
  };


  return (
    <div style={{ display: "flex", gap: "10px", overflowX: "auto", padding: "10px" }}>
      {stages.map((stage) => {
  const filteredCandidates = jobCandidates.filter(candidate => candidate.progress === stage.progress_code);
  return (
    <KanbanColumn 
      key={stage.id} 
      stageCode={stage.progress_code}
      title={stage.progress_label} 
      candidates={filteredCandidates} 
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragStart={onDragStart}
      style={{ minWidth: "250px", backgroundColor: stage.progress_color_code }}
    />
  );
})}
    </div>
  );
};

export default KanbanBoard;
