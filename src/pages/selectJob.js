
import {Select} from "antd";
import KanbanBoard from "./kanbanBoard";
import { useEffect, useState } from "react";

const SelectJob = () => {

     const[allJobs,setAllJobs] = useState([]);
     const [selectedJob , setSelectedJob] = useState(null);

    useEffect(()=>{
        fetch("/hiring_pipeline.json") 
      .then((response) => response.json())
      .then((data) => { 
        setAllJobs (data.jobs) ;
      })
    },[]) ;

    const handleChange = (job) => {
        return setSelectedJob(job);
    }

return (
    <>
    <Select 
    style={{
        width: 240,
      }}
    onChange={(value)=>{handleChange(value)}}
    options = {
    allJobs.map(job=>({
         value : job.job_title 
    }))
    }
    >   
    </Select>
    {selectedJob && <KanbanBoard job = {selectedJob}></KanbanBoard>}
    </>
)
}

export default SelectJob ; 