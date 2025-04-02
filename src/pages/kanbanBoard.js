import { useEffect, useState } from "react";
import { Modal } from "antd";
import KanbanColumn from "../temp/KanbanColumn";

const KanbanBoard = ({job}) => {
  const [stages, setStages] = useState([]);
  const [jobCandidates , setJobCandidates] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingCandidate, setPendingCandidate] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);

  useEffect(() => {
    fetch("/hiring_pipeline.json") 
      .then((response) => response.json())
      .then((data) => {
        const jobPipeline = data.jobs.find(pipeline => pipeline.job_title === job);
        const filteredStages = jobPipeline.pipeline.filter(stage => !stage.parent_progress_id);
        setStages(filteredStages);
      })
      .catch((error) => console.error("Error loading pipeline:", error));

    fetch("/candidates.json")
      .then((response) => response.json())
      .then((data) => {
        const currentJobCandidates = data.candidates.filter(candidate => 
            candidate.applied_jobs.some(canJob => canJob.job_title === job)
          );
        setJobCandidates(currentJobCandidates);
      })
      .catch((error) => console.error("error fetching candidates",error));
  }, [job]); 
    
  const onDragStart = (e, candidateId) => {
    console.log("Dragging candidate ID:", candidateId);
    e.dataTransfer.setData("candidateId", candidateId);
  };

  const onDragOver = (e) => {   
    e.preventDefault();
    console.log("Dragging over a droppable area");
  };

  const onDrop = (e, newStatus) => {
   
    const candidateId = e.dataTransfer.getData("candidateId");

    const targetStage = stages.find(stage => stage.progress_code === newStatus);
    if (!targetStage) return;

    if (targetStage.restricted) {
        console.log("Restricted stage , modal should be visible");
        setPendingCandidate(candidateId);
        setPendingStatus(newStatus);
        setModalVisible(true);
        return;
    }

    moveCandidate(candidateId, newStatus);
  };

  const moveCandidate = (candidateId, newStatus) => {
    setJobCandidates((prevCandidates) =>
        prevCandidates.map((candidate) =>
            candidate.id === candidateId ? { ...candidate, progress: newStatus } : candidate
        )
    );
    setModalVisible(false);
  };

  return (
    <>
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
      
      {/* Restricted Move Confirmation Modal */}
      <Modal
        title="Restricted Stage"
        open={modalVisible}
        onOk={() => moveCandidate(pendingCandidate, pendingStatus)}
        onCancel={() => setModalVisible(false)}
        okText="Yes, Move"
        cancelText="Cancel"
      >
        This stage is restricted. Are you sure you want to move the candidate?
      </Modal>
    </>
  );
};

export default KanbanBoard;
