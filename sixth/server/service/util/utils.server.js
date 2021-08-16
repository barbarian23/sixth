export const getCountTr = paragraph => {
    try {
        var regex = /[<][T][R][^>]+/g;
        return paragraph.match(regex).length;
    } catch (e) {
        console.log("get count Tr error ", e);
    }
}

export const getListTr = paragraph => {
    try {
        var regex = /([<][T][R][^>]+)[\d]+([^R])+/g;
        return paragraph.match(regex);
    } catch (e) {
        console.log("get list tr ", e);
    }
}

export const getListTd = paragraph => {
    try {
        // <TD width="5%" align=center>1</TD>
        // <TD width="10%" align=center><INPUT onclick=chon_tb(84846715163,1) id=1 type=radio name=choice> </TD>
        // <TD width="30%" align=center>84846715163</TD>
        // <TD width="15%" align=center>0</TD>
        // <TD width="15%" align=center>0</TD>
        // <TD width="25%" align=center>Kho trả sau VTT và khách hàng chọn số</TD></TR>
        var regex = /[<][T][D][^<]+/g;
        return paragraph.match(regex);
    } catch (e) {
        console.log("get list td ", e);
    }
}

export const getTdInformation = paragraph => {
    try {
        //<TD width="30%" align=center>84846715163
        var regex = /[^>]+/g;
        return paragraph.match(regex);
    } catch (e) {
        console.log("get td information ", e);
    }
}