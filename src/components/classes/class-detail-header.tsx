// src/components/classes/class-detail-header.tsx
"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ClassRoom } from "@/types";

interface ClassDetailHeaderProps {
  classInfo: ClassRoom;
}

export const ClassDetailHeader: React.FC<ClassDetailHeaderProps> = ({ classInfo }) => {
  return (
    <Card className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 bg-opacity-20 backdrop-blur-lg shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white">
          {classInfo.name} (Grade {classInfo.gradeLevel})
        </CardTitle>
        <CardDescription className="text-sm text-gray-200">
          {classInfo.branchName} • {classInfo.category}
        </CardDescription>
        <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-100">
          <span>Students: {classInfo.totalStudents}/{classInfo.capacity}</span>
          <span>Sections: {classInfo.sections.length}</span>
          <span>Subjects: {classInfo.subjects.length}</span>
        </div>
      </CardHeader>
    </Card>
  );
};
