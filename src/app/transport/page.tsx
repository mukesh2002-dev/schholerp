"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import {
  Vehicle,
  VehicleStatus,
  TransportRoute,
  Driver,
  BusHelper,
  StudentTransportAssignment,
} from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
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
  ExternalLink,
  Clock,
  Fuel,
  Shield,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function TransportPage() {
  const { activeBranchId } = useERP();
  const [vehicles, setVehicles] = useState(() =>
    mockDb.getVehicles(activeBranchId)
  );
  const [routes] = useState(() =>
    mockDb.getTransportRoutes(activeBranchId)
  );
  const [drivers] = useState(() => mockDb.getDrivers(activeBranchId));
  const [helpers] = useState(() => mockDb.getBusHelpers(activeBranchId));
  const [assignments] = useState(() =>
    mockDb.getStudentTransportAssignments(activeBranchId)
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesSearch =
        v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.model.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        vehicleTypeFilter === "ALL" || v.vehicleType === vehicleTypeFilter;
      const matchesStatus =
        statusFilter === "ALL" || v.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [vehicles, searchQuery, vehicleTypeFilter, statusFilter]);

  const activeVehicles = vehicles.filter((v) => v.status === "ACTIVE").length;
  const totalStudentsTransported = assignments.filter(
    (a) => a.status === "ACTIVE"
  ).length;

  const getStatusVariant = (status: VehicleStatus) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "MAINTENANCE":
        return "warning";
      case "INACTIVE":
        return "secondary";
      case "RETIRED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getRouteStatusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "INACTIVE":
        return "secondary";
      case "SUSPENDED":
        return "warning";
      default:
        return "outline";
    }
  };

  const getDriverStatusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "ON_LEAVE":
        return "warning";
      case "INACTIVE":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Transport & Fleet
            </h1>
            <Badge variant="outline" className="text-xs">
              {vehicles.length} Vehicles
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage school transport fleet, routes, drivers, and student
            assignments.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Vehicles"
          value={vehicles.length}
          icon={<Bus className="h-5 w-5" />}
          iconColor="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Active Vehicles"
          value={activeVehicles}
          icon={<Truck className="h-5 w-5" />}
          iconColor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Total Routes"
          value={routes.length}
          icon={<Route className="h-5 w-5" />}
          iconColor="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          title="Students Transported"
          value={totalStudentsTransported}
          icon={<Users className="h-5 w-5" />}
          iconColor="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
      </div>

      <Tabs defaultValue="vehicles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vehicles" className="gap-1.5">
            <Bus className="h-3.5 w-3.5" />
            Vehicles
          </TabsTrigger>
          <TabsTrigger value="routes" className="gap-1.5">
            <Route className="h-3.5 w-3.5" />
            Routes
          </TabsTrigger>
          <TabsTrigger value="staff" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Drivers & Helpers
          </TabsTrigger>
          <TabsTrigger value="assignments" className="gap-1.5">
            <UserCheck className="h-3.5 w-3.5" />
            Student Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles" className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search registration, brand, model..."
                  className="pl-9 h-9 text-xs"
                />
              </div>
              <Select
                value={vehicleTypeFilter}
                onValueChange={setVehicleTypeFilter}
              >
                <SelectTrigger className="w-[130px] h-9 text-xs">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="BUS">Bus</SelectItem>
                  <SelectItem value="VAN">Van</SelectItem>
                  <SelectItem value="MINIBUS">Minibus</SelectItem>
                  <SelectItem value="CAR">Car</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-9 text-xs">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="RETIRED">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredVehicles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No vehicles found matching your criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVehicles.map((vehicle) => (
                <Link key={vehicle.id} href={`/transport/${vehicle.id}`}>
                  <Card className="group cursor-pointer hover:border-primary/40 transition-all duration-200 h-full">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-mono font-bold text-sm text-foreground">
                            {vehicle.registrationNumber}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {vehicle.brand} {vehicle.model}
                          </p>
                        </div>
                        <Badge
                          variant={getStatusVariant(vehicle.status)}
                          className="text-[10px]"
                        >
                          {vehicle.status}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Type</span>
                          <span className="font-medium text-foreground">
                            {vehicle.vehicleType}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            Capacity
                          </span>
                          <span className="font-medium text-foreground">
                            {vehicle.capacity} seats
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            Assigned Route
                          </span>
                          <span className="font-medium text-foreground truncate max-w-[150px] text-right">
                            {vehicle.assignedRouteName || "—"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Year</span>
                          <span className="font-medium text-foreground">
                            {vehicle.year}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Fuel className="h-3 w-3" />
                          {vehicle.fuelType}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Shield className="h-3 w-3" />
                          Exp: {vehicle.insuranceExpiry}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          {routes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No routes found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routes.map((route) => (
                <Card key={route.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-mono font-bold text-xs text-foreground">
                            {route.routeNumber}
                          </h3>
                          <Badge
                            variant={getRouteStatusVariant(route.status)}
                            className="text-[10px]"
                          >
                            {route.status}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-0.5">
                          {route.routeName}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          Stops:{" "}
                          <span className="font-medium text-foreground">
                            {route.stops.length}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Users className="h-3 w-3" />
                          Students:{" "}
                          <span className="font-medium text-foreground">
                            {route.studentCount}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Bus className="h-3 w-3" />
                          Vehicle:{" "}
                          <span className="font-medium text-foreground">
                            {route.vehicleRegistration || "—"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Capacity:{" "}
                          <span className="font-medium text-foreground">
                            {route.capacity}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border/50 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Driver</span>
                        <span className="font-medium text-foreground">
                          {route.driverName || "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-muted-foreground">Helper</span>
                        <span className="font-medium text-foreground">
                          {route.helperName || "—"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Drivers ({drivers.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drivers.map((driver) => (
                <Card key={driver.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={
                          driver.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name)}&background=random`
                        }
                        alt={driver.name}
                        className="h-10 w-10 rounded-lg object-cover ring-1 ring-border shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-semibold text-sm text-foreground truncate">
                            {driver.name}
                          </h4>
                          <Badge
                            variant={getDriverStatusVariant(driver.status)}
                            className="text-[10px] shrink-0"
                          >
                            {driver.status}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {driver.employeeId} • {driver.branchName}
                        </p>
                        <div className="mt-2 space-y-0.5 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              License
                            </span>
                            <span className="font-medium text-foreground">
                              {driver.licenseNumber}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              Assigned Vehicle
                            </span>
                            <span className="font-medium text-foreground">
                              {driver.assignedVehicleReg || "—"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              Experience
                            </span>
                            <span className="font-medium text-foreground">
                              {driver.experienceYears} years
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Bus Helpers ({helpers.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {helpers.map((helper) => (
                <Card key={helper.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={
                          helper.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(helper.name)}&background=random`
                        }
                        alt={helper.name}
                        className="h-10 w-10 rounded-lg object-cover ring-1 ring-border shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-semibold text-sm text-foreground truncate">
                            {helper.name}
                          </h4>
                          <Badge
                            variant={
                              helper.status === "ACTIVE"
                                ? "success"
                                : "secondary"
                            }
                            className="text-[10px] shrink-0"
                          >
                            {helper.status}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {helper.employeeId} • {helper.branchName}
                        </p>
                        <div className="mt-2 space-y-0.5 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              Assigned Route
                            </span>
                            <span className="font-medium text-foreground">
                              {helper.assignedRouteName || "—"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Phone</span>
                            <span className="font-medium text-foreground font-mono">
                              {helper.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          {assignments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No student transport assignments found.
            </div>
          ) : (
            <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Stop</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Fee/Month</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id} className="hover:bg-muted/40">
                      <TableCell>
                        <div>
                          <p className="font-semibold text-sm text-foreground">
                            {assignment.studentName}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {assignment.studentRoll} • {assignment.className}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-foreground">
                        {assignment.routeName}
                      </TableCell>
                      <TableCell className="text-xs text-foreground">
                        {assignment.stopName}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-foreground">
                        {assignment.vehicleRegistration}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            assignment.shift === "BOTH"
                              ? "info"
                              : assignment.shift === "MORNING"
                              ? "success"
                              : "purple"
                          }
                          className="text-[10px]"
                        >
                          {assignment.shift}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-foreground">
                        {formatCurrency(assignment.feePerMonth)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            assignment.status === "ACTIVE"
                              ? "success"
                              : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {assignment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
