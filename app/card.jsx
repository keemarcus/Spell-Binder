import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet, Pressable, TextInput, Image } from 'react-native'

import { useState, useEffect, useContext } from 'react'
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "@/context/ThemeContext";
import { StatusBar } from "expo-status-bar";
import { Inter_500Medium, useFonts } from "@expo-google-fonts/inter";
import Octicons from "@expo/vector-icons/Octicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function EditScreen() {
    const { id } = useLocalSearchParams()
    const [todo, setTodo] = useState({})
    const { colorScheme, setColorScheme, theme } = useContext(ThemeContext)
    const router = useRouter()

    var [searchCard, setSearchCard] = useState("black lotus");
    var [cardName, setCardName] = useState("");
    var [cardText, setCardText] = useState("");
    var [cardImage, setCardImage] = useState("");

    const [loaded, error] = useFonts({
        Inter_500Medium,
    })

    if (!loaded && !error) {
        return null
    }

    const styles = createStyles(theme, colorScheme)

    const handleSave = async () => {
        try {
            const savedTodo = { ...todo, title: todo.title }

            const jsonValue = await AsyncStorage.getItem('TodoApp')
            const storageTodos = jsonValue != null ? JSON.parse(jsonValue) : null

            if (storageTodos && storageTodos.length) {
                const otherTodos = storageTodos.filter(todo => todo.id !== savedTodo.id)
                const allTodos = [...otherTodos, savedTodo]
                await AsyncStorage.setItem('TodoApp', JSON.stringify(allTodos))
            } else {
                await AsyncStorage.setItem('TodoApp', JSON.stringify([savedTodo]))
            }

            router.push('/')
        } catch (e) {
            console.error(e)
        }
    }

    const findCard = async () => {
        //var url = "https://api.magicthegathering.io/v1/cards/?name=" + searchCard
        var url = "https://api.scryfall.com/cards/named?fuzzy=" + searchCard
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const card = await response.json();
            console.log(card);

            console.log(card['name']);
            setCardName(card['name']);
            setCardText(card['oracle_text']);
            setCardImage(card['image_uris']['large']);
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    maxLength={30}
                    placeholder="Edit todo"
                    placeholderTextColor="gray"
                    onChangeText={setSearchCard}
                    value={searchCard || ''}
                //onChangeText={(text) => setTodo(prev => ({ ...prev, title: text }))}
                />
                <Pressable
                    onPress={() => setColorScheme(colorScheme === 'light' ? 'dark' : 'light')} style={{ marginLeft: 10 }}>

                    <Octicons name={colorScheme === 'dark' ? "moon" : "sun"} size={36} color={theme.text} selectable={undefined} style={{ width: 36 }} />

                </Pressable>
            </View>
            <View style={styles.inputContainer}>
                <Pressable
                    //onPress={handleSave}
                    onPress={findCard}
                    style={styles.saveButton}
                >
                    <Text style={styles.saveButtonText}>Search</Text>
                </Pressable>
                <Pressable
                    onPress={() => router.push('/')}
                    style={[styles.saveButton, { backgroundColor: 'red' }]}
                >
                    <Text style={[styles.saveButtonText, { color: 'white' }]}>Cancel</Text>
                </Pressable>
            </View>
            <View style={{width:'100%'}}>
                <Text style={styles.text}>{cardName}</Text>
                <Image
                    style={styles.cardImage}
                    source={{ uri: cardImage }}
                />
                <Text style={styles.text}>{cardText}</Text>
            </View>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </SafeAreaView>
    )
}

function createStyles(theme, colorScheme) {
    return StyleSheet.create({
        container: {
            flex: 1,
            width: '100%',
            backgroundColor: theme.background,
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10,
            gap: 6,
            width: '100%',
            maxWidth: 1024,
            marginHorizontal: 'auto',
            pointerEvents: 'auto',
        },
        input: {
            flex: 1,
            borderColor: 'gray',
            borderWidth: 1,
            borderRadius: 5,
            padding: 10,
            marginRight: 10,
            fontSize: 18,
            fontFamily: 'Inter_500Medium',
            minWidth: 0,
            color: theme.text,
        },
        saveButton: {
            backgroundColor: theme.button,
            borderRadius: 5,
            padding: 10,
        },
        saveButtonText: {
            fontSize: 18,
            color: colorScheme === 'dark' ? 'black' : 'white',
        },
        cardImage:{
            width: '80%', 
            //alignContent: 'center',
            aspectRatio: 2.5/3.5,
            alignSelf: 'center',
            //alignItems: 'center',
        }, text:{
            width: '80%', 
        }
    })
}