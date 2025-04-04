import { useEffect, useState, useRef } from "react";
import { Modal } from "antd";
import KanbanColumn from "../temp/KanbanColumn";

const KanbanBoard = ({ job }) => {
  const [stages, setStages] = useState([]);
  const [jobCandidates, setJobCandidates] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingCandidate, setPendingCandidate] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);
  const scrollContainerRef = useRef(null);
  const scrollThumbRef = useRef(null);
  const scrollbarTrackRef = useRef(null);

  useEffect(() => {
    fetch("/hiring_pipeline.json")
      .then((response) => response.json())
      .then((data) => {
        const jobPipeline = data.jobs.find((pipeline) => pipeline.job_title === job);
        const filteredStages = jobPipeline.pipeline.filter((stage) => !stage.parent_progress_id);
        setStages(filteredStages);
      })
      .catch((error) => console.error("Error loading pipeline:", error));

    fetch("/candidates.json")
      .then((response) => response.json())
      .then((data) => {
        const currentJobCandidates = data.candidates.filter((candidate) =>
          candidate.applied_jobs.some((canJob) => canJob.job_title === job)
        );
        setJobCandidates(currentJobCandidates);
      })
      .catch((error) => console.error("error fetching candidates", error));
  }, [job]);

  const onDragStart = (e, candidateId) => {
    e.dataTransfer.setData("candidateId", candidateId);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e, newStatus) => {
    const candidateId = e.dataTransfer.getData("candidateId");
    const targetStage = stages.find((stage) => stage.progress_code === newStatus);
    if (!targetStage) return;

    if (targetStage.restricted) {
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

  useEffect(() => {
    const updateThumbSize = () => {
      if (scrollContainerRef.current && scrollThumbRef.current && scrollbarTrackRef.current) {
        const { scrollWidth, clientWidth } = scrollContainerRef.current;
        const thumbWidth = (clientWidth / scrollWidth) * clientWidth;
        scrollThumbRef.current.style.width = `${thumbWidth}px`;
      }
    };
    updateThumbSize();
    window.addEventListener("resize", updateThumbSize);
    return () => window.removeEventListener("resize", updateThumbSize);
  }, [stages]);

  const syncScroll = () => {
    if (scrollContainerRef.current && scrollThumbRef.current && scrollbarTrackRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const maxScrollLeft = scrollWidth - clientWidth;
      const maxThumbLeft = scrollbarTrackRef.current.clientWidth - scrollThumbRef.current.clientWidth;
      const newThumbLeft = (scrollLeft / maxScrollLeft) * maxThumbLeft;
      scrollThumbRef.current.style.left = `${newThumbLeft}px`;
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.addEventListener("scroll", syncScroll);
    }
    return () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.removeEventListener("scroll", syncScroll);
      }
    };
  }, []);

  const startDrag = (e) => {
    const startX = e.clientX;
    const thumbPosition = scrollThumbRef.current.offsetLeft;
    const maxScrollLeft = scrollbarTrackRef.current.clientWidth - scrollThumbRef.current.clientWidth;

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      let newPosition = thumbPosition + deltaX;
      newPosition = Math.max(0, Math.min(maxScrollLeft, newPosition));
      scrollThumbRef.current.style.left = `${newPosition}px`;
      scrollContainerRef.current.scrollLeft = (newPosition / maxScrollLeft) * (scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <>
      <div
        ref={scrollContainerRef}
        style={{
          display: "flex",
          gap: "10px",
          overflowX: "auto",
          padding: "10px",
          whiteSpace: "nowrap",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        className="kanban-content"
      >
        {stages.map((stage) => {
          const filteredCandidates = jobCandidates.filter(
            (candidate) => candidate.progress === stage.progress_code
          );
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

      {/* Custom Scrollbar */}
      <div
        ref={scrollbarTrackRef}
        style={{
          height: "12px",
          width: "100vw",
          position: "fixed",
          bottom: "10px",
          left: "0px",
          zIndex: "1000",
          background: "#ddd",
          borderRadius: "6px",
          cursor: "pointer",
          overflow: "hidden",
        }}
      >
        <div
          ref={scrollThumbRef}
          onMouseDown={startDrag}
          style={{
            height: "12px",
            background: "#888",
            borderRadius: "6px",
            cursor: "grab",
            position: "absolute",
            left: "0px",
          }}
        ></div>
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
