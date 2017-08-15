from sikuli.Sikuli import *

running = True #script running/not running

def runHotKey(event):
    global running
    running = False

def initSetup():
    Env.addHotkey(Key.F1, KeyModifier.CTRL, runHotKey) #CTRL + F1 will kill the script
    Settings.MoveMouseDelay = 0.0
    setAutoWaitTimeout(2)

def getCredentials():
    areCredentialsCorrect = False
    while areCredentialsCorrect is False: 
        hostUserName = input("Steam Username", "Username", "Steam Username")
        hostPassword = input("Steam Password", "Password", "Steam Password")
        areCredentialsCorrect = popAsk("Are these credentials correct?", "Confirm!")
    return [hostUserName, hostPassword]

def maximizeAppToFullscreen(appname):
    instance = switchApp(appname)
    wait(1)
    type(" ", KEY_ALT)
    type("x")


def maximizeSteam():
    minimizedSteamTaskbarPattern = Pattern("steam_taskbar_minimized.png").similar(0.95)
    minimizedSteamPattern = Pattern("steam_minimized.png").similar(0.95)
    if exists(minimizedSteamPattern):
        click(minimizedSteamPattern)
    else:
        if exists(minimizedSteamTaskbarPattern):
            doubleClick(minimizedSteamTaskbarPattern)
    maximizeAppToFullscreen("Steam")

def checkWhichSteamWindow():
    maximizeSteam()
    wait(1)
    steamLogin = exists(Pattern("steam_login_2.png").similar(0.70))
    steamWindow = exists(Pattern("steam_main_menu.png").similar(0.70))
    if steamLogin:
        return "login"
    if steamWindow:
        return "window"
    return "none"

def loginSequence(username, password):
    wait("steam_login.png", FOREVER)
    click(Pattern("steam_login.png").targetOffset(-100,-64))
    type("a", KeyModifier.CTRL)
    type(Key.DELETE)
    type(username)
    type(Key.TAB)
    type("a", KeyModifier.CTRL)
    type(Key.DELETE)
    type(password)
    type(Key.ENTER)

def openSteamFromStartMenu():
    click(Pattern("startmenu.png").similar(0.80)) #start menu
    wait("powerbutton.png", FOREVER) # wait for power button
    type("Steam")
    wait("steam_startmenu.png", FOREVER) 
    type(Key.ENTER)
    return True

def openAndLoginSteam(username, password):
    status = checkWhichSteamWindow()
    if status == "none":
        openSteamFromStartMenu()
        loginSequence(username, password)
        return True
        
    elif status == "login":
        maximizeSteam()
        loginSequence(username, password)
        
    elif status == "window":
        return True
    
    else:
        return False

def main():
#     while running:
    initSetup()
    credentials = getCredentials()
    print(openAndLoginSteam(credentials[0], credentials[1]))




main()