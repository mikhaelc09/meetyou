module.exports = {
    getCalendar: (req, res) => {
        return res.status(200).json({
            message: 'GET calendar'
        })
    }

}