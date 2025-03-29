import { Card, Avatar, Tag, Modal, Button } from "antd";
import { useState } from "react";

const KanbanCard = ({ candidate, onDragStart, stageColor }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  return (
    <>
      <Card
        style={{
          width: "100%",
          maxWidth: "250px",
          minHeight: "150px",
          backgroundColor: "#fff",
          borderLeft: `5px solid ${stageColor}`,
          boxShadow: `0 2px 5px rgba(0,0,0,0.1)`,
          cursor: "pointer" 
        }}
        className="candidate-card"
        draggable="true"
        onDragStart={(e) => onDragStart(e, candidate.id)}
        onClick={showModal} 
      >
        <Card.Meta
          avatar={<Avatar style={{ marginLeft: "-25px", marginTop: "-15px" }}>{candidate.first_name[0]}{candidate.last_name[0]}</Avatar>}
          title={
            <div
              style={{
                fontSize: "12px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                width: "100%",
                display: "block",
                textAlign: "left",
                marginTop: "-5px"
              }}
            >
              {candidate.first_name + " " + candidate.last_name}
            </div>
          }
          description={<Tag 
            style={{
              fontSize: "10px",
            }}
            color="blue">{candidate.current_job_title}</Tag>}
        />
      </Card>

     
      <Modal title="Candidate Details" open={isModalOpen} onCancel={handleCancel} footer={null}>
        <p><strong>Name:</strong> {candidate.first_name} {candidate.last_name}</p>
        <p><strong>Job Title:</strong> {candidate.current_job_title}</p>
        <p><strong>Email:</strong> {candidate.email}</p>
        <p><strong>Phone:</strong> {candidate.phone}</p>
        <p><strong>Skills:</strong> {candidate.topskills}</p>
        {candidate.resumeViewToken && (
          <Button type="primary" href={candidate.resumeViewToken.resumeurl} target="_blank">
            View Resume
          </Button>
        )}
      </Modal>
    </>
  );
};

export default KanbanCard;
