import { FC } from 'react'
import { Lead } from '@/types/dashboard'
import ProjectLeadsClient from './ProjectLeadsClient'

interface ProjectLeadsProps {
  leads: Lead[]
}

const ProjectLeads: FC<ProjectLeadsProps> = ({ leads }) => {
  return <ProjectLeadsClient leads={leads} />
}

export default ProjectLeads 