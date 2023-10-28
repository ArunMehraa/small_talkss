
import { Avatar,Box,Button,Text, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, Input, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Spinner, Tooltip, useDisclosure, useToast } from '@chakra-ui/react';
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons';
import React from 'react';
import { useState } from 'react';
import { ChatState } from '../../Context/ChatProvider';
import ProfileModel from './ProfileModel';
import { useHistory } from 'react-router-dom';
import ChatLoading from '../ChatLoading';
import axios from 'axios';
import UserListItem from '../UserAvatar/UserListItem';
import { getSender } from '../../config/ChatLogics';
import NotificationBadge from 'react-notification-badge';
// import { useEffect } from 'react';

const SideDrawer = () => {
    const [search, setSearch] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState();
    const { user, setSelectedChat,chats,setChats,notifications,setNotifications} = ChatState();
    const history = useHistory();
    const { isOpen, onOpen, onClose } = useDisclosure();
    
    const toast = useToast();
    const handleSearch = async() => {
        if(!search){
            toast({
                title: "Please enter a name or email to search",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top-left"
              });
              return;
        }
        try{
            setLoading(true);
            const config = {
                headers:    {
                    Authorization: `Bearer ${user.token}`,
                },
            };
        const {data} = await axios.get(`/api/user?search=${search}`,config);

            setLoading(false);
            setSearchResult(data);
        } catch(error) {
            toast({
                title: "Error occured!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
                description: "Error occured while searching for users",
              });
              setLoading(false);
        }
    };
    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        history.push('/');
    };

    const accesssChat = async (userId) =>{
        try{
            setLoadingChat(true);

            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const {data} = await axios.post("/api/chat",{ userId },config);
            console.log(data);
            if(!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
            console.log(data);
            setSelectedChat(data);
           setLoadingChat(false);
           onClose();

        }
        catch(error){
            toast({
                title: "Error fetching the chat!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
                description: error.message,
                console: error.message,
              });
              setLoadingChat(false);
        }
    }

    return (
        <>
            <Box display="flex" justifyContent='space-between' alignContent='center' bg='white' w='100%' p='5px 10px 5px 10px' borderWidth='5px'>
                <Tooltip label="search users to chat" hasArrow placement='bottom-end'>
                    <Button variant="ghost" bg="gray.200" onClick={onOpen}>
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <Text d={{ base: "none", md: "flex" }} px="4" >
                            Search User
                        </Text>
                    </Button>
                </Tooltip>

                <Text fontSize="2xl" fontWeight="bold" font fontFamily='Work sans'>
                    Small-Talks
                </Text>

                <div>
                    <Menu>
                        <MenuButton p={1}>
                            <NotificationBadge count={notifications.length} />
                            <BellIcon fontSize={"2xl"} m={1} />
                        </MenuButton>
                        <MenuList pl={2}>
                            {!notifications.length && "No New Notifications"}
                            {notifications.map((notif) => (
                                <MenuItem key={notif._id} onClick={()=>{
                                    setSelectedChat(notif.chat);
                                    setNotifications(notifications.filter((n) => n !== notif));
                                }}>
                                    <Avatar size="xs" mr={2} name={notif.sender.name} src={notif.sender.pic} />
                                    {notif.chat.isGroupChat ? `New Messaeg in ${notif.chat.chatName}` : `New Message from ${getSender(user,notif.chat.users)} `}
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Menu>
                    <Menu >
                        <MenuButton bg="white" as={Button} rightIcon={<ChevronDownIcon />}>
                            <Avatar size="sm" cursor="pointer" name={user.name} src={user.pic}></Avatar>
                        </MenuButton>
                        <MenuList>
                            <ProfileModel user={user}>
                                <MenuItem>My Profile</MenuItem>
                            </ProfileModel>
                            <MenuDivider />
                            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
                        </MenuList>
                    </Menu>
                </div>
            </Box>
            <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
                    <DrawerBody>
                        <Box display="flex" pb={2}>
                            <Input
                                placeholder='Search by Name or Email'
                                mr={2}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Button onClick={handleSearch}>
                                Go
                            </Button>
                        </Box>
                        {loading? (<ChatLoading/>) : (
                            searchResult?.map( (user) => (
                                <UserListItem
                                    key={user._id}
                                    user = {user}
                                    handleFunction={()=>accesssChat(user._id)}
                                />
                            ))
                        )}
                        {loadingChat && <Spinner ml="auto" display="flex" />}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    );
}

export default SideDrawer;