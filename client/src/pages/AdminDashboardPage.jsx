import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getStats, getAllUsers, getAllRides, getAllFeedback, reset } from '../store/admin/adminSlice';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Spinner from '../components/Spinner';
import { format } from 'date-fns';

const AdminDashboardPage = () => {
    const dispatch = useDispatch();
    const { stats, users, rides, feedback, isLoading } = useSelector(state => state.admin);

    useEffect(() => {
        dispatch(getStats());
        dispatch(getAllUsers());
        dispatch(getAllRides());
        dispatch(getAllFeedback());

        return () => {
            dispatch(reset());
        };
    }, [dispatch]);

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            {isLoading && !stats ? <div className="flex justify-center"><Spinner /></div> : (
                <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.users}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.rides}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed Rides</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.completedRides}</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Tabs defaultValue="users" className="w-full">
                <TabsList>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="rides">Rides</TabsTrigger>
                    <TabsTrigger value="feedback">Feedback</TabsTrigger>
                </TabsList>
                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Joined</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map(user => (
                                        <TableRow key={user._id}>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.role}</TableCell>
                                            <TableCell>{format(new Date(user.createdAt), 'PP')}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="rides">
                     <Card>
                        <CardHeader>
                            <CardTitle>All Rides</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>From</TableHead>
                                        <TableHead>To</TableHead>
                                        <TableHead>Driver</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Passengers</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rides.map(ride => (
                                        <TableRow key={ride._id}>
                                            <TableCell>{ride.from.text}</TableCell>
                                            <TableCell>{ride.to.text}</TableCell>
                                            <TableCell>{ride.driver.name}</TableCell>
                                            <TableCell>{ride.status}</TableCell>
                                            <TableCell>{ride.passengers.length} / {ride.passengers.length + ride.seatsAvailable}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="feedback">
                     <Card>
                        <CardHeader>
                            <CardTitle>App Feedback</CardTitle>
                            <CardDescription>Here's what users are saying about the app.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Message</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {feedback.map(item => (
                                        <TableRow key={item._id}>
                                            <TableCell>{item.user.name}</TableCell>
                                            <TableCell><Badge variant="secondary">{item.type}</Badge></TableCell>
                                            <TableCell className="max-w-sm whitespace-pre-wrap">{item.message}</TableCell>
                                            <TableCell>{format(new Date(item.createdAt), 'PP')}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminDashboardPage;