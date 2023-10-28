import { Container, Text, Box, Tab, Tabs,TabList,TabPanel,TabPanels } from "@chakra-ui/react";
import React from "react";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";
import { useHistory } from "react-router-dom";
import { useEffect } from "react";

const Homepage = () => {

    const history = useHistory();
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("userInfo"));
        if(user) {
            history.push("/chats");
        }
    },[history]);

    return (
        <Container>
            <Box
                bg="linear-gradient(to right top, #4226c2, #9f00a6, #cd0085, #e51867, #ed4f4f);"
                w="100%"
                display="flex"
                p={3}
                m={"40px 0 15px 0"}
                borderRadius="lg"
                borderWidth="1px"
                justifyContent={"center"}
            >
                <Text
                    fontSize="4xl"
                    fontFamily="work sans"
                    fontWeight="bold"
                    color="white"

                >Small Talks</Text>
            </Box>
            <Box
                bg={"white"}
                color={"black"}
                w={"100%"}
                p={4}
                borderRadius={"lg"}
                borderWidth={"1px"}
            >
                <Tabs variant='soft-rounded' colorScheme='orange'>
                    <TabList mb={"1em"}>
                        <Tab width="50%">Login</Tab>
                        <Tab width="50%">Sign Up</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <Login/>
                        </TabPanel>
                        <TabPanel>
                            <Signup/>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>
        </Container>
    );
}

export default Homepage;
