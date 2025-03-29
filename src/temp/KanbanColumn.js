import KanbanCard from "./KanbanCard";
import "../Kanban.css";
import { Card } from "antd";

const KanbanColumn = ({ stageCode, title, candidates, onDrop, onDragOver, onDragStart, style }) => {
  return (
    <Card
      className="kanban-column"
      style={{
        flex: 1, 
        minWidth: "330px",
        maxWidth: "350px", 
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f4f4f4",
        borderRadius: "8px",
        padding: "10px",
      }}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, stageCode)}
    >
      <div
        style={{
          backgroundColor: style.backgroundColor,
          color: "#fff",
          padding: "8px",
          textAlign: "center",
          fontWeight: "bold",
          borderRadius: "6px",
        }}
      >
        {title}
      </div>
      <div
        style={{
          flexGrow: 1, 
          overflowY: "auto", 
          marginTop: "10px",
          paddingRight: "5px",
        }}
      >
        {candidates.map((candidate) => (
          <KanbanCard key={candidate.id} candidate={candidate} onDragStart={onDragStart} stageColor={style.backgroundColor} />
        ))}
      </div>
    </Card>
  );
};

export default KanbanColumn;
