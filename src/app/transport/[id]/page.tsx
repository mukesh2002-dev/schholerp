"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { mockDb } from "@/lib/services/mock-db";
import { Vehicle, VehicleMaintenance, TransportRoute } from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  ArrowLeft,
  Bus,
  Fuel,
  Shield,
  Calendar,
  MapPin,
  Users,
  Clock,
  Wrench,
  Route,
  UserCheck,
  Gauge,
  Car,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function VehicleDetailPage() {
  const params = useParams();
  const vehicleId = params.id as string;

  const vehicle = useState(() => mockDb.getVehicleById(vehicleId))[0];
  const maintenance = useState(() =>
    mockDb.getVehicleMaintenance(vehicleId)
  )[0];
  const allRoutes = useState(() => mockDb.getTransportRoutes())[0];

  const assignedRoute = useMemo(() => {
    if (!vehicle?.assignedRouteId) return null;
    return allRoutes.find((r) => r.id === vehicle.assignedRouteId) || null;
  }, [allRoutes, vehicle?.assignedRouteId]);

  if (!vehicle) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <Breadcrumbs />
        <div className="text-center py-16">
          <Car className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h2 className="text-xl font-semibold text-foreground">
            Vehicle Not Found
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            The requested vehicle does not exist or has been removed.
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/transport">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Transport
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
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

  const getMaintenanceStatusVariant = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "IN_PROGRESS":
        return "warning";
      case "SCHEDULED":
        return "info";
      default:
        return "outline";
    }
  };

  const totalMaintenanceCost = maintenance.reduce((acc, m) => acc + m.cost, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumbs />

      <Button asChild variant="ghost" size="sm" className="w-fit gap-1.5">
        <Link href="/transport">
          <ArrowLeft className="h-4 w-4" />
          Back to Fleet
        </Link>
      </Button>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-80 shrink-0">
          <Card>
            <CardContent className="p-0">
              <div className="relative h-48 rounded-t-xl overflow-hidden bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center">
                {vehicle.photo ? (
                  <img
                    src={vehicle.photo}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Bus className="h-16 w-16 text-muted-foreground/40" />
                )}
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Registration
                  </p>
                  <p className="font-mono font-bold text-lg text-foreground">
                    {vehicle.registrationNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Brand & Model</p>
                  <p className="font-semibold text-foreground">
                    {vehicle.brand} {vehicle.model}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Type</span>
                  <Badge variant="outline" className="text-[10px]">
                    {vehicle.vehicleType}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Capacity</span>
                  <span className="text-sm font-medium text-foreground">
                    {vehicle.capacity} seats
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <Badge
                    variant={getStatusVariant(vehicle.status)}
                    className="text-[10px]"
                  >
                    {vehicle.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Branch</span>
                  <span className="text-xs font-medium text-foreground text-right">
                    {vehicle.branchName}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 min-w-0">
          <Tabs defaultValue="details" className="space-y-4">
            <TabsList>
              <TabsTrigger value="details" className="gap-1.5">
                <Car className="h-3.5 w-3.5" />
                Details
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="gap-1.5">
                <Wrench className="h-3.5 w-3.5" />
                Maintenance History
              </TabsTrigger>
              <TabsTrigger value="route" className="gap-1.5">
                <Route className="h-3.5 w-3.5" />
                Assigned Route
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Vehicle Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Year</p>
                        <p className="font-medium text-foreground">
                          {vehicle.year}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Color</p>
                        <p className="font-medium text-foreground">
                          {vehicle.color}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Fuel Type
                        </p>
                        <div className="flex items-center gap-1.5">
                          <Fuel className="h-3.5 w-3.5 text-muted-foreground" />
                          <p className="font-medium text-foreground">
                            {vehicle.fuelType}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          GPS Device
                        </p>
                        <p className="font-medium text-foreground font-mono">
                          {vehicle.gpsDeviceId || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Insurance Expiry
                        </p>
                        <div className="flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                          <p className="font-medium text-foreground">
                            {formatDate(vehicle.insuranceExpiry)}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Last Service
                        </p>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <p className="font-medium text-foreground">
                            {formatDate(vehicle.lastServiceDate)}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Next Service
                        </p>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <p className="font-medium text-foreground">
                            {formatDate(vehicle.nextServiceDate)}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Assigned Route
                        </p>
                        <p className="font-medium text-foreground">
                          {vehicle.assignedRouteName || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {vehicle.capacity}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Seats
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {maintenance.length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Maintenance Records
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(totalMaintenanceCost)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Total Maintenance Cost
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Maintenance History
                    <Badge variant="outline" className="text-[10px] ml-auto">
                      {maintenance.length} Records
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {maintenance.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No maintenance records found for this vehicle.
                    </div>
                  ) : (
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right tabular-nums">Cost</TableHead>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {maintenance.map((record) => (
                            <TableRow
                              key={record.id}
                              className="hover:bg-muted/40"
                            >
                              <TableCell>
                                <Badge variant="outline" className="text-[10px]">
                                  {record.type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <p className="text-xs text-foreground max-w-[250px]">
                                  {record.description}
                                </p>
                                {record.notes && (
                                  <p className="text-[11px] text-muted-foreground mt-0.5 italic">
                                    {record.notes}
                                  </p>
                                )}
                              </TableCell>
                              <TableCell className="text-right tabular-nums text-xs font-medium text-foreground">
                                {formatCurrency(record.cost)}
                              </TableCell>
                              <TableCell className="text-xs text-foreground">
                                {record.vendor}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {formatDate(record.date)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={getMaintenanceStatusVariant(
                                    record.status
                                  )}
                                  className="text-[10px]"
                                >
                                  {record.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="route" className="space-y-4">
              {assignedRoute ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Route className="h-4 w-4" />
                        Route Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Route Number
                            </p>
                            <p className="font-mono font-bold text-foreground">
                              {assignedRoute.routeNumber}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Route Name
                            </p>
                            <p className="font-medium text-foreground">
                              {assignedRoute.routeName}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Branch
                            </p>
                            <p className="font-medium text-foreground">
                              {assignedRoute.branchName}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Status
                            </p>
                            <Badge
                              variant={
                                assignedRoute.status === "ACTIVE"
                                  ? "success"
                                  : "secondary"
                              }
                              className="text-[10px]"
                            >
                              {assignedRoute.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Total Distance
                            </p>
                            <p className="font-medium text-foreground">
                              {assignedRoute.totalDistance} km
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Estimated Duration
                            </p>
                            <p className="font-medium text-foreground">
                              {assignedRoute.estimatedDuration} min
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Morning Departure
                            </p>
                            <p className="font-medium text-foreground">
                              {assignedRoute.morningDeparture}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Evening Departure
                            </p>
                            <p className="font-medium text-foreground">
                              {assignedRoute.eveningDeparture}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">
                          {assignedRoute.stops.length}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Stops
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">
                          {assignedRoute.studentCount}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Students
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">
                          {assignedRoute.capacity}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Capacity
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">
                          {Math.round(
                            (assignedRoute.studentCount /
                              assignedRoute.capacity) *
                              100
                          )}
                          %
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Utilization
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Stops List
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-right tabular-nums">#</TableHead>
                              <TableHead>Stop Name</TableHead>
                              <TableHead>Address</TableHead>
                              <TableHead>Arrival</TableHead>
                              <TableHead>Departure</TableHead>
                              <TableHead className="text-right tabular-nums">Students</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {assignedRoute.stops.map((stop, index) => (
                              <TableRow
                                key={stop.id}
                                className="hover:bg-muted/40"
                              >
                                <TableCell className="text-right tabular-nums text-xs font-mono text-muted-foreground">
                                  {index + 1}
                                </TableCell>
                                <TableCell className="text-xs font-medium text-foreground">
                                  {stop.name}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {stop.address}
                                </TableCell>
                                <TableCell className="text-xs font-mono text-foreground">
                                  {stop.arrivalTime}
                                </TableCell>
                                <TableCell className="text-xs font-mono text-foreground">
                                  {stop.departureTime}
                                </TableCell>
                                <TableCell className="text-right tabular-nums text-xs font-medium text-foreground">
                                  {stop.studentCount}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {(assignedRoute.driverName || assignedRoute.helperName) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          Assigned Staff
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {assignedRoute.driverName && (
                            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                              <p className="text-xs text-muted-foreground mb-1">
                                Driver
                              </p>
                              <p className="font-medium text-sm text-foreground">
                                {assignedRoute.driverName}
                              </p>
                            </div>
                          )}
                          {assignedRoute.helperName && (
                            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                              <p className="text-xs text-muted-foreground mb-1">
                                Bus Helper
                              </p>
                              <p className="font-medium text-sm text-foreground">
                                {assignedRoute.helperName}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Route className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                    <p className="text-sm font-medium text-foreground">
                      No Route Assigned
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This vehicle is not currently assigned to any route.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
