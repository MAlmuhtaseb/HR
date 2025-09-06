export interface Employee{
  id: number;
  name: string;
  positionId?: number;
  positionName?: string;
  birthdate?: Date;
  isActive: boolean;
  startDate: Date;
  phone?: string;
  managerId?: number | null; // Accept Multiple Data Types 
  managerName?: string | null; // Accept Multiple Data Types 
  departmentId?: number;
  departmentName?: string;
  image?: any,
  imagePath?: string;
  isImage?: boolean;
} 