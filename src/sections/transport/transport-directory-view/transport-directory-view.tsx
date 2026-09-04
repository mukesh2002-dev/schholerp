"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Vehicle, VehicleStatus, TransportRoute, Driver } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Bus,
  Users,
  MapPin,
  Truck,
  UserCheck,
  Route,
  Clock,
  Fuel,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export function TransportDirectoryView() {
  const { activeBranchId } = useERP();
  const [vehicles] = useState(() => mockDb.getVehicles(activeBranchId));
  const [routes] = useState(() => mockDb.getTransportRoutes(activeBranchId));
  const [drivers] = useState(() => mockDb.getDrivers(activeBranchId));
  const [assignments] = useState(() => mockDb.getStudentTransportAssignments(activeBranchId));

  const [activeTab, setActiveTab] = useState("routes");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredRoutes = useMemo(() => {
    return routes.filter((r) => {
      const matchSearch =
        r.routeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.routeNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.stops?.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [routes, searchQuery, statusFilter]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchSearch =
        v.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.model?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "ALL" || v.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [vehicles, searchQuery, statusFilter]);

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
          <TabsList className="h-9">
            <TabsTrigger value="routes" className="text-xs px-3">
              Routes ({routes.length})
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="text-xs px-3">
              Fleet Buses ({vehicles.length})
            </TabsTrigger>
            <TabsTrigger value="drivers" className="text-xs px-3">
              Drivers ({drivers.length})
            </TabsTrigger>
            <TabsTrigger value="students" className="text-xs px-3">
              Students ({assignments.length})
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search route, bus #, driver..."
              className="pl-9 h-8 text-xs"
            />
          </div>
        </div>

        {/* Tab 1: Routes */}
        <TabsContent value="routes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoutes.map((r) => (
              <Card key={r.id} className="border-border/80 shadow-2xs hover:border-primary/40 transition-colors">
                <CardContent className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-primary">{r.routeNumber}</span>
                        <Badge variant="outline" className="text-[10px]">{r.status}</Badge>
                      </div>
                      <h3 className="font-bold text-base text-foreground mt-1">{r.routeName}</h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-foreground">
                      {r.driverName || `Cap: ${r.capacity}`}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground pt-1 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {r.stops[0]?.name || "Origin"} → {r.stops[r.stops.length - 1]?.name || "Destination"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span>{r.stops.length} designated pickup stops</span>
                      <span className="font-semibold text-foreground">{r.vehicleRegistration || "No Bus"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 2: Vehicles */}
        <TabsContent value="vehicles" className="space-y-4">
          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Registration #</TableHead>
                  <TableHead>Make &amp; Model</TableHead>
                  <TableHead className="text-right tabular-nums">Capacity</TableHead>
                  <TableHead>Fuel Type</TableHead>
                  <TableHead>Assigned Route</TableHead>
                  <TableHead>Campus</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((v) => (
                  <TableRow key={v.id} className="hover:bg-muted/40">
                    <TableCell className="font-mono font-bold text-xs">{v.registrationNumber}</TableCell>
                    <TableCell className="text-sm font-semibold text-foreground">
                      {v.brand} {v.model} ({v.year})
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-xs font-mono font-medium">{v.capacity || 0} Seats</TableCell>
                    <TableCell className="text-xs">{v.fuelType}</TableCell>
                    <TableCell className="text-xs font-medium">{v.assignedRouteName || "Unassigned"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{v.branchName}</TableCell>
                    <TableCell>
                      <Badge variant={v.status === "ACTIVE" ? "success" : "warning"} className="text-[10px]">
                        {v.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Tab 3: Drivers */}
        <TabsContent value="drivers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map((d) => (
              <Card key={d.id} className="border-border/80 shadow-2xs">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{d.name}</h4>
                      <p className="text-xs text-muted-foreground font-mono">Lic: {d.licenseNumber}</p>
                    </div>
                    <Badge variant={d.status === "ACTIVE" ? "success" : "secondary"} className="text-[10px]">
                      {d.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>Exp: {d.experienceYears} Years</span>
                    <span>Ph: {d.phone}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 4: Students */}
        <TabsContent value="students" className="space-y-4">
          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Roll #</TableHead>
                  <TableHead>Route Name</TableHead>
                  <TableHead>Pickup Stop</TableHead>
                  <TableHead>Assigned Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((a) => (
                  <TableRow key={a.id} className="hover:bg-muted/40">
                    <TableCell className="font-semibold text-sm">{a.studentName}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{a.studentRoll}</TableCell>
                    <TableCell className="text-xs font-bold text-primary">{a.routeName}</TableCell>
                    <TableCell className="text-xs">{a.stopName}</TableCell>
                    <TableCell className="text-xs font-mono">{formatDate(a.assignedDate)}</TableCell>
                    <TableCell>
                      <Badge variant="success" className="text-[10px]">{a.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
