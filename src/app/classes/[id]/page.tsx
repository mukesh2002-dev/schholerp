// src/app/classes/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { mockDb } from "@/lib/services/mock-db";
import { ClassRoom, Section } from "@/types";
import { ClassDetailHeader } from "@/components/classes/class-detail-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const SectionList: React.FC<{ sections: Section[] }> = ({ sections }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {sections.map((sec) => (
      <Card key={sec.id} className="bg-white/10 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-white">{sec.name}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-200">
          <p>Room: {sec.roomNumber}</p>
          <p>Teacher: {sec.classTeacherName}</p>
          <p>
            Students: {sec.studentCount}/{sec.capacity}
          </p>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default function ClassDetailPage() {
  const { id } = useParams();
  const [classInfo, setClassInfo] = useState<ClassRoom | null>(null);

  useEffect(() => {
    if (id) {
      const data = mockDb.getClassById(id as string);
      setClassInfo(data ?? null);
    }
  }, [id]);

  if (!classInfo) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400">Loading class information...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <ClassDetailHeader classInfo={classInfo} />

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 backdrop-blur">
          <TabsTrigger value="info" className="text-white">Info</TabsTrigger>
          <TabsTrigger value="sections" className="text-white">Sections</TabsTrigger>
          <TabsTrigger value="students" className="text-white">Students</TabsTrigger>
          <TabsTrigger value="timetable" className="text-white">Timetable</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Class Overview</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-200">
              <p>{classInfo.description}</p>
              <p className="mt-2">
                Total Students: {classInfo.totalStudents}/{classInfo.capacity}
              </p>
              <p>Subjects Offered: {classInfo.subjects.map((s) => s.name).join(", ")}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections" className="mt-4">
          <SectionList sections={classInfo.sections} />
        </TabsContent>

        <TabsContent value="students" className="mt-4">
          {/* Placeholder – student grid would be implemented later */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Students</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-200">
              <p>Student list view coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timetable" className="mt-4">
          {/* Placeholder – timetable component */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Timetable</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-200">
              <p>Weekly timetable view coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
