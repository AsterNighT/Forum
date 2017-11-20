﻿// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
import * as React from 'react';
import { MessageMessageState } from '../States/MessageMessageState';
import { MessagePersonInfo } from '../Props/MessagePersonInfo';
import { MessagePerson } from './MessagePerson';
import { MessageWindow } from './MessageWindow';
import * as Utility from '../Utility';

/**
 * 我的私信，包括最近联系人列表和聊天窗口两个组件
 */
export class MessageMessage extends React.Component<{}, MessageMessageState> {

    constructor(props) {
        super(props);
        let defaultData = [{
            id: null,
            name: '系统',
            portraitUrl: 'http://www.cc98.org/pic/anonymous.gif',
            message: [{
                id: 9898,
                senderId: 9898,
                receiverId: 9898,
                content: "",
                isRead: true,
                time: new Date(),
            }]
        }];
        this.state = {
            data: defaultData,
            chatObj: defaultData[0]
        };
        //如果没有设置默认的state，render第一次渲染的时候state为空，MessageWindow组件会报错
    }

    async componentDidMount() {
        let token = Utility.getLocalStorage("accessToken");

        //获取到本人信息
        let myInfo = Utility.getLocalStorage("userInfo");

        //创建一个数组存储联系人信息
        let recentContact = await Utility.getRecentContact(0, 6);

        //看url中是否携带id信息，如果有的话就作为第一个联系人
        console.log(location.href);
        let urlMessage = location.href.match(/id=(\S+)/);
        console.log(`携带信息${urlMessage}`);
        if (urlMessage) {
            let chatManId = parseInt(urlMessage[1]);
            console.log(chatManId);
            let response = await fetch(`http://apitest.niconi.cc/user/basic/${chatManId}`);
            let chatMan = await response.json();
            console.log(chatMan);
            chatMan.message = await Utility.getRecentMessage(chatManId, 0, 10);
            let chatContact = [chatMan];
            console.log(chatContact);
            recentContact = chatContact.concat(recentContact);
            console.log(recentContact);
        }

        console.log(recentContact);
        if (recentContact) {
            //默认第一个人为聊天对象
            this.setState({ data: recentContact, chatObj: recentContact[0] });
        }
        //默认选中第一个联系人
        $(`#${this.state.chatObj.name}`).addClass('message-message-pFocus');
    }

    //对this.stata.data进行批量化转化为JSX的函数，每个JSX可点击改变state里聊天对象的信息
    coverMessagePerson = (item: MessagePersonInfo) => {
        const changeChatName = () => {
            this.setState({ chatObj: item });
		    //给选中的聊天对象添加选中效果
		    $('.message-message-pList > div').removeClass('message-message-pFocus');
		    $(`#${item.name}`).addClass('message-message-pFocus');
        };
        return <div onClick={changeChatName} id={`${item.name}`}><MessagePerson data={item} /></div>;
	};

	render() {
        //给我的私信添加选中样式
        $('.message-nav > div').removeClass('message-nav-focus');
        $('#message').addClass('message-nav-focus');
        //创建联系人列表和聊天窗口
        console.log("重新渲染");
        return (<div className="message-message">
                <div className="message-message-people">
                    <div className="message-message-pTitle">近期私信</div>
                    <div className="message-message-pList">{this.state.data.map(this.coverMessagePerson)}</div>
                </div>
                <MessageWindow data={this.state.chatObj} />
            </div>);
    }
}

//查找数组arr中是否存在元素的名字为obj
function contains(arr , obj) {
    let i = arr.length;
    while (i--) {
        if (arr[i].name === obj) {
            return true;
        }
    }
    return false;
}